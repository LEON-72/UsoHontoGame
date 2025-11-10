# Research: Game Preparation for Moderators

**Feature**: 002-game-preparation
**Date**: 2025-11-10
**Purpose**: Research technical approaches for game creation, presenter management, and episode registration

## Research Questions

This document addresses the technical decisions needed to implement game preparation functionality following the project's Clean Architecture and component architecture principles, with SQLite as the persistence layer.

## 1. Database Choice: SQLite Integration

### Decision
Use SQLite as the persistence layer with Prisma ORM for type-safe database access and migrations.

### Rationale
- **User Requirement**: Explicitly requested SQLite database
- **Simplicity**: No separate database server to manage - file-based storage
- **Next.js Compatible**: Works seamlessly with Next.js App Router and Server Actions
- **Type Safety**: Prisma provides end-to-end type safety from database to TypeScript
- **Migrations**: Prisma Migrate handles schema evolution cleanly
- **Development Experience**: Local development requires no setup beyond file creation
- **Production Ready**: SQLite handles moderate traffic well (thousands of concurrent readers)
- **Atomic Transactions**: ACID compliance ensures data integrity for game state changes

### Alternatives Considered

**Alternative 1: Continue with In-Memory Storage**
- **Rejected Because**: Data is lost on server restart. Games and presenter episodes need persistence. Not suitable for production use.

**Alternative 2: PostgreSQL**
- **Rejected Because**: Requires separate database server. Over-engineered for current scale (50 games per moderator). Higher operational complexity.

**Alternative 3: MongoDB**
- **Rejected Because**: Document database not ideal for relational data (games → presenters → episodes). SQLite's relational model better matches domain.

### Implementation Approach

```prisma
// prisma/schema.prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL") // file:./dev.db
}

generator client {
  provider = "prisma-client-js"
}

model Game {
  id             String      @id @default(uuid())
  creatorId      String      // Session ID of creator
  playerLimit    Int
  status         String      // '準備中' | '出題中' | '締切'
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  presenters     Presenter[]
}

model Presenter {
  id        String    @id @default(uuid())
  gameId    String
  nickname  String    // From session
  game      Game      @relation(fields: [gameId], references: [id], onDelete: Cascade)
  episodes  Episode[]
  createdAt DateTime  @default(now())
}

model Episode {
  id          String    @id @default(uuid())
  presenterId String
  text        String    // Max 1000 chars
  isLie       Boolean   // The lie marker
  presenter   Presenter @relation(fields: [presenterId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
}
```

## 2. Repository Pattern with Prisma

### Decision
Implement repository pattern using Prisma Client as the underlying data access layer, maintaining Clean Architecture boundaries.

### Rationale
- **Follows Constitution Principle I**: Clean Architecture with domain interfaces
- **Type Safety**: Prisma Client provides compile-time type checking
- **Testability**: Repositories can be mocked for testing use cases
- **Migration Path**: Easy to swap Prisma for another ORM if needed
- **Transaction Support**: Prisma supports transactions for atomic operations
- **Query Builder**: Type-safe query construction prevents SQL injection

### Alternatives Considered

**Alternative 1: Raw SQLite queries**
- **Rejected Because**: No type safety. Prone to SQL injection. Manual schema management. Violates type safety principle (V).

**Alternative 2: Drizzle ORM**
- **Rejected Because**: While lightweight and SQL-like, Prisma has better Next.js integration, more mature ecosystem, and superior TypeScript inference.

### Implementation Approach

```typescript
// src/server/infrastructure/repositories/PrismaGameRepository.ts
import { PrismaClient } from '@prisma/client';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import { Game } from '@/server/domain/entities/Game';
import { GameId } from '@/server/domain/value-objects/GameId';
import { GameStatus } from '@/server/domain/value-objects/GameStatus';

export class PrismaGameRepository implements IGameRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<Game[]> {
    const games = await this.prisma.game.findMany({
      include: { presenters: { include: { episodes: true } } }
    });
    return games.map(g => this.toDomain(g));
  }

  async findByStatus(status: GameStatus): Promise<Game[]> {
    const games = await this.prisma.game.findMany({
      where: { status: status.value },
      include: { presenters: { include: { episodes: true } } }
    });
    return games.map(g => this.toDomain(g));
  }

  async create(game: Game): Promise<void> {
    await this.prisma.game.create({
      data: this.toPersistence(game)
    });
  }

  // ... other repository methods

  private toDomain(data: any): Game {
    // Map Prisma data to domain entity
  }

  private toPersistence(game: Game): any {
    // Map domain entity to Prisma data
  }
}
```

## 3. Migration from In-Memory to SQLite

### Decision
Maintain both InMemoryGameRepository (for testing) and PrismaGameRepository (for production), selectable via dependency injection.

### Rationale
- **Testing Speed**: In-memory repository keeps tests fast
- **Clean Architecture**: Same IGameRepository interface works with both
- **Gradual Migration**: Can deploy with in-memory first, then enable SQLite
- **Development Flexibility**: Developers can use in-memory for rapid iteration

### Implementation Approach

```typescript
// src/server/infrastructure/repositories/index.ts
import { PrismaClient } from '@prisma/client';
import { InMemoryGameRepository } from './InMemoryGameRepository';
import { PrismaGameRepository } from './PrismaGameRepository';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';

const USE_DATABASE = process.env.USE_DATABASE === 'true';

export function getGameRepository(): IGameRepository {
  if (USE_DATABASE) {
    const prisma = new PrismaClient();
    return new PrismaGameRepository(prisma);
  }
  return InMemoryGameRepository.getInstance();
}
```

## 4. Presenter and Episode Management

### Decision
Implement nested Server Actions for managing presenters and episodes within a game context, leveraging Prisma's cascade deletes.

### Rationale
- **Data Integrity**: Prisma cascade deletes ensure orphaned records don't exist
- **Atomic Operations**: Server Actions with Prisma transactions ensure consistency
- **Type Safety**: End-to-end type safety from database to client
- **Simplicity**: No complex state management - server is source of truth

### Alternatives Considered

**Alternative 1: Client-side state management (React Query, Zustand)**
- **Rejected Because**: Adds complexity. Server-side rendering + Server Actions simpler for MVP. No need for optimistic updates yet.

**Alternative 2: GraphQL**
- **Rejected Because**: Over-engineered for MVP. REST-like Server Actions sufficient. Would require additional setup and learning curve.

### Implementation Approach

```typescript
// src/app/actions/game.ts
'use server';

import { getGameRepository } from '@/server/infrastructure/repositories';
import { AddPresenter } from '@/server/application/use-cases/games/AddPresenter';
import { revalidatePath } from 'next/cache';

export async function addPresenterAction(gameId: string, nickname: string) {
  try {
    const repository = getGameRepository();
    const useCase = new AddPresenter(repository);
    await useCase.execute(gameId, nickname);

    revalidatePath('/games/[id]', 'page');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add presenter'
    };
  }
}
```

## 5. Form State Management and Validation with Zod

### Decision
Use Zod for schema validation at both API boundaries and form inputs, integrated with custom hooks for state management.

### Rationale
- **User Requirement**: Explicitly requested Zod for validation
- **Type Safety**: Zod provides runtime validation that matches TypeScript types
- **Single Source of Truth**: Define validation schemas once, use everywhere (forms, Server Actions, use cases)
- **Constitution Compliance**: All logic in custom hooks, components purely presentational (Principle III)
- **Error Messages**: Zod provides clear, customizable error messages in Japanese
- **Testability**: Schemas are independently testable
- **Framework Agnostic**: Works with Server Actions, use cases, and forms

### Alternatives Considered

**Alternative 1: Manual validation in custom hooks**
- **Rejected Because**: User explicitly requested Zod. Manual validation would duplicate logic across layers and lack runtime type safety.

**Alternative 2: Formik**
- **Rejected Because**: Heavy library. Zod + custom hooks provide better TypeScript integration and lighter bundle size.

**Alternative 3: Yup**
- **Rejected Because**: Zod has better TypeScript inference and is more actively maintained. Zod is the modern standard in the Next.js ecosystem.

### Implementation Approach

**Step 1: Define Zod Schemas (Validation Layer)**

```typescript
// src/server/domain/schemas/gameSchemas.ts
import { z } from 'zod';

export const GameStatusSchema = z.enum(['準備中', '出題中', '締切'], {
  errorMap: () => ({ message: 'ステータスは「準備中」「出題中」「締切」のいずれかでなければなりません' })
});

export const GameIdSchema = z.string().uuid({
  message: 'ゲームIDは有効なUUIDでなければなりません'
});

export const CreateGameSchema = z.object({
  playerLimit: z.number()
    .int({ message: 'プレイヤー数は整数でなければなりません' })
    .min(1, { message: 'プレイヤー数は1以上でなければなりません' })
    .max(100, { message: 'プレイヤー数は100以下でなければなりません' })
});

export const EpisodeSchema = z.object({
  text: z.string()
    .min(1, { message: 'エピソードは1文字以上でなければなりません' })
    .max(1000, { message: 'エピソードは1000文字以下でなければなりません' }),
  isLie: z.boolean()
});

export const AddPresenterSchema = z.object({
  gameId: GameIdSchema,
  nickname: z.string()
    .min(1, { message: 'ニックネームを入力してください' })
});

// Infer TypeScript types from Zod schemas
export type CreateGameInput = z.infer<typeof CreateGameSchema>;
export type EpisodeInput = z.infer<typeof EpisodeSchema>;
export type AddPresenterInput = z.infer<typeof AddPresenterSchema>;
```

**Step 2: Use Zod in Server Actions**

```typescript
// src/app/actions/game.ts
'use server';

import { CreateGameSchema } from '@/server/domain/schemas/gameSchemas';

export async function createGameAction(rawInput: unknown) {
  try {
    // Validate input with Zod
    const input = CreateGameSchema.parse(rawInput);

    const sessionId = await getSessionId();
    const repository = getGameRepository();
    const useCase = new CreateGame(repository);
    const gameId = await useCase.execute(sessionId, input.playerLimit);

    revalidatePath('/games');
    return { success: true, gameId };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create game',
    };
  }
}
```

**Step 3: Integrate Zod with Custom Hooks**

```typescript
// src/hooks/useGameForm.ts
'use client';

import { useState } from 'react';
import { CreateGameSchema, type CreateGameInput } from '@/server/domain/schemas/gameSchemas';
import { z } from 'zod';

export function useGameForm(initialData?: CreateGameInput) {
  const [formData, setFormData] = useState<CreateGameInput>(
    initialData ?? { playerLimit: 10 }
  );
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const validate = (): boolean => {
    try {
      CreateGameSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.flatten().fieldErrors as Record<string, string[]>);
      }
      return false;
    }
  };

  const handleChange = (field: keyof CreateGameInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  return { formData, errors, validate, handleChange };
}
```

## 6. Status Transition Validation

### Decision
Implement status transitions as domain methods with validation logic in Game entity, enforced at database level with CHECK constraints where possible.

### Rationale
- **Domain-Driven**: Business rules live in domain layer
- **Data Integrity**: Database constraints provide last line of defense
- **Clear API**: Explicit methods (startAccepting, close) better than property setters
- **Audit Trail**: Entity methods can log state changes

### Alternatives Considered

**Alternative 1: Status as enum in database only**
- **Rejected Because**: Business logic scattered. No validation at domain layer.

**Alternative 2: State machine library**
- **Rejected Because**: Over-engineered for 3 states. Domain methods sufficient.

### Implementation Approach

```typescript
// src/server/domain/entities/Game.ts
export class Game {
  private _status: GameStatus;

  startAccepting(): void {
    if (this._status.value !== '準備中') {
      throw new InvalidStatusTransitionError('Can only start from 準備中');
    }
    if (this.presenters.length === 0) {
      throw new ValidationError('Cannot start without presenters');
    }
    if (!this.allPresentersHaveCompleteEpisodes()) {
      throw new ValidationError('All presenters must have 3 episodes with lie marked');
    }
    this._status = new GameStatus('出題中');
    this._updatedAt = new Date();
  }

  close(): void {
    if (this._status.value !== '出題中') {
      throw new InvalidStatusTransitionError('Can only close from 出題中');
    }
    this._status = new GameStatus('締切');
    this._updatedAt = new Date();
  }

  private allPresentersHaveCompleteEpisodes(): boolean {
    return this.presenters.every(p =>
      p.episodes.length === 3 &&
      p.episodes.filter(e => e.isLie).length === 1
    );
  }
}
```

## 7. Episode Lie Marker Confidentiality

### Decision
Store lie marker in database with row-level security enforced in repository layer, never expose in public APIs.

### Rationale
- **Security**: Critical game mechanic - must not leak to players
- **Repository Pattern**: Access control in data access layer
- **Type Safety**: Separate DTOs for presenter view vs player view
- **Audit**: Can track unauthorized access attempts

### Implementation Approach

```typescript
// src/server/application/dto/EpisodeDto.ts
// Public view for players
export interface EpisodeDto {
  id: string;
  text: string;
  // NO isLie field
}

// Private view for presenter/moderator
export interface EpisodeWithLieDto extends EpisodeDto {
  isLie: boolean;
}

// src/server/application/use-cases/games/GetGameForPlayer.ts
export class GetGameForPlayer {
  async execute(gameId: string, playerId: string): Promise<GameDto> {
    const game = await this.gameRepo.findById(new GameId(gameId));

    return {
      id: game.id.value,
      presenters: game.presenters.map(p => ({
        nickname: p.nickname,
        episodes: p.episodes.map(e => ({
          id: e.id.value,
          text: e.text,
          // isLie NEVER included for players
        }))
      }))
    };
  }
}
```

## 8. Game List Filtering and Sorting

### Decision
Filter games by creator (session ID) in repository layer with efficient SQLite queries, add index on creatorId.

### Rationale
- **Performance**: Index on creatorId ensures fast lookups
- **Security**: Users only see their own games
- **Scalability**: Query-time filtering scales better than loading all games
- **SQLite Strength**: Excellent for read-heavy workloads with proper indexes

### Implementation Approach

```sql
-- Migration: Add index for game list queries
CREATE INDEX idx_games_creator_status ON games(creatorId, status);
CREATE INDEX idx_games_creator_created ON games(creatorId, createdAt DESC);
```

```typescript
// src/server/infrastructure/repositories/PrismaGameRepository.ts
async findByCreator(creatorId: string): Promise<Game[]> {
  const games = await this.prisma.game.findMany({
    where: { creatorId },
    orderBy: { createdAt: 'desc' },
    include: {
      presenters: {
        include: {
          episodes: true
        }
      }
    }
  });
  return games.map(g => this.toDomain(g));
}
```

## Summary of Technical Decisions

| Area | Decision | Key Benefit |
|------|----------|-------------|
| **Database** | SQLite with Prisma ORM | Simple, type-safe, file-based persistence |
| **Repository** | Prisma Client behind IRepository interface | Clean Architecture, testable, type-safe |
| **Testing** | InMemory + Prisma repos via DI | Fast tests, production-ready code |
| **Forms** | Custom hooks with validation | Constitution-compliant, testable |
| **Status** | Domain methods with validation | Business logic in domain layer |
| **Security** | Repository-level access control | Lie markers never exposed |
| **Performance** | SQLite indexes on common queries | Fast game list loads |

All decisions align with the project constitution's core principles (Clean Architecture, Component Architecture, Custom Hooks, TDD, Type Safety, Server Components First) and meet the functional requirements defined in the specification, while leveraging SQLite as requested.
