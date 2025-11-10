# Implementation Quickstart: Game Preparation for Moderators

**Feature**: 002-game-preparation
**Date**: 2025-11-10
**Purpose**: Step-by-step guide to implement the game preparation feature following Clean Architecture

## Prerequisites

- Session management system (001-session-top-page) implemented
- TOP page ready to display games in 出題中 status
- Node.js, npm, and Next.js 15+ installed
- TypeScript 5 with strict mode enabled

## Phase 0: Setup SQLite + Prisma + Zod

### Step 1: Install Dependencies

```bash
# Database
npm install prisma @prisma/client
npm install -D prisma

# Validation
npm install zod
```

### Step 2: Initialize Prisma

```bash
npx prisma init --datasource-provider sqlite
```

This creates:
- `prisma/schema.prisma` - Database schema
- `.env` - Environment variables with `DATABASE_URL`

### Step 3: Configure Database URL

Edit `.env`:
```env
DATABASE_URL="file:./dev.db"
USE_DATABASE="true"
```

### Step 4: Define Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Game {
  id          String      @id @default(uuid())
  creatorId   String
  playerLimit Int
  status      String      // '準備中' | '出題中' | '締切'
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  presenters  Presenter[]

  @@index([creatorId, status])
  @@index([creatorId, createdAt])
}

model Presenter {
  id        String    @id @default(uuid())
  gameId    String
  nickname  String
  game      Game      @relation(fields: [gameId], references: [id], onDelete: Cascade)
  episodes  Episode[]
  createdAt DateTime  @default(now())

  @@index([gameId])
}

model Episode {
  id          String    @id @default(uuid())
  presenterId String
  text        String
  isLie       Boolean
  presenter   Presenter @relation(fields: [presenterId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())

  @@index([presenterId])
}
```

### Step 5: Run Migration

```bash
npx prisma migrate dev --name init
npx prisma generate
```

This creates:
- `prisma/dev.db` - SQLite database file
- `prisma/migrations/` - Migration history
- `node_modules/.prisma/client/` - Generated Prisma Client

### Step 5.5: Create Zod Validation Schemas

**File**: `src/server/domain/schemas/gameSchemas.ts`

```typescript
import { z } from 'zod';

// Value Object Schemas
export const GameIdSchema = z.string().uuid({
  message: 'ゲームIDは有効なUUIDでなければなりません'
});

export const GameStatusSchema = z.enum(['準備中', '出題中', '締切'], {
  errorMap: () => ({
    message: 'ステータスは「準備中」「出題中」「締切」のいずれかでなければなりません'
  })
});

// Input Schemas for Server Actions
export const CreateGameSchema = z.object({
  playerLimit: z.number()
    .int({ message: 'プレイヤー数は整数でなければなりません' })
    .min(1, { message: 'プレイヤー数は1以上でなければなりません' })
    .max(100, { message: 'プレイヤー数は100以下でなければなりません' })
});

export const AddPresenterSchema = z.object({
  gameId: GameIdSchema,
  nickname: z.string()
    .min(1, { message: 'ニックネームを入力してください' })
    .max(50, { message: 'ニックネームは50文字以下でなければなりません' })
});

export const AddEpisodeSchema = z.object({
  presenterId: z.string().uuid(),
  text: z.string()
    .min(1, { message: 'エピソードは1文字以上でなければなりません' })
    .max(1000, { message: 'エピソードは1000文字以下でなければなりません' }),
  isLie: z.boolean()
});

// Type inference from schemas
export type CreateGameInput = z.infer<typeof CreateGameSchema>;
export type AddPresenterInput = z.infer<typeof AddPresenterSchema>;
export type AddEpisodeInput = z.infer<typeof AddEpisodeSchema>;
```

**Benefits of placing Zod schemas here:**
- Single source of truth for validation rules
- TypeScript types automatically inferred
- Used in both Server Actions (API boundary) and custom hooks (form validation)
- Testable independently of UI and domain logic

## Phase 1: Domain Layer (NO External Dependencies)

### Step 6: Create Value Objects

**File**: `src/server/domain/value-objects/GameId.ts`

```typescript
import { ValidationError } from '../errors/ValidationError';

export class GameId {
  private readonly _value: string;

  constructor(value: string) {
    if (!this.isValidUUID(value)) {
      throw new ValidationError('Game ID must be a valid UUID');
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  equals(other: GameId): boolean {
    return this._value === other._value;
  }

  static generate(): GameId {
    return new GameId(crypto.randomUUID());
  }

  private isValidUUID(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }
}
```

**File**: `src/server/domain/value-objects/GameStatus.ts`

```typescript
import { ValidationError } from '../errors/ValidationError';

export class GameStatus {
  private readonly _value: '準備中' | '出題中' | '締切';

  constructor(value: '準備中' | '出題中' | '締切') {
    if (!['準備中', '出題中', '締切'].includes(value)) {
      throw new ValidationError(`Invalid game status: ${value}`);
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  isAcceptingResponses(): boolean {
    return this._value === '出題中';
  }

  canEdit(): boolean {
    return this._value === '準備中';
  }

  equals(other: GameStatus): boolean {
    return this._value === other._value;
  }
}
```

### Step 7: Create Domain Errors

**File**: `src/server/domain/errors/ValidationError.ts`

```typescript
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

**File**: `src/server/domain/errors/InvalidStatusTransitionError.ts`

```typescript
export class InvalidStatusTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStatusTransitionError';
  }
}
```

### Step 8: Create Presenter Entity

**File**: `src/server/domain/entities/Presenter.ts`

```typescript
import { ValidationError } from '../errors/ValidationError';
import type { Episode } from './Episode';

export class Presenter {
  constructor(
    private readonly _id: string,
    private readonly _gameId: string,
    private readonly _nickname: string,
    private readonly _episodes: Episode[],
    private readonly _createdAt: Date
  ) {
    if (_episodes.length > 3) {
      throw new ValidationError('Presenter cannot have more than 3 episodes');
    }
  }

  get id(): string {
    return this._id;
  }

  get gameId(): string {
    return this._gameId;
  }

  get nickname(): string {
    return this._nickname;
  }

  get episodes(): Episode[] {
    return [...this._episodes];
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  hasCompleteEpisodes(): boolean {
    return (
      this._episodes.length === 3 &&
      this._episodes.filter((e) => e.isLie).length === 1
    );
  }
}
```

### Step 9: Create Episode Entity

**File**: `src/server/domain/entities/Episode.ts`

```typescript
import { ValidationError } from '../errors/ValidationError';

export class Episode {
  constructor(
    private readonly _id: string,
    private readonly _presenterId: string,
    private readonly _text: string,
    private readonly _isLie: boolean,
    private readonly _createdAt: Date
  ) {
    if (_text.length === 0 || _text.length > 1000) {
      throw new ValidationError('Episode text must be 1-1000 characters');
    }
  }

  get id(): string {
    return this._id;
  }

  get presenterId(): string {
    return this._presenterId;
  }

  get text(): string {
    return this._text;
  }

  get isLie(): boolean {
    return this._isLie;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
```

### Step 10: Create Game Entity

**File**: `src/server/domain/entities/Game.ts`

```typescript
import { GameId } from '../value-objects/GameId';
import { GameStatus } from '../value-objects/GameStatus';
import { ValidationError } from '../errors/ValidationError';
import { InvalidStatusTransitionError } from '../errors/InvalidStatusTransitionError';
import type { Presenter } from './Presenter';

export class Game {
  constructor(
    private readonly _id: GameId,
    private readonly _creatorId: string,
    private readonly _playerLimit: number,
    private _status: GameStatus,
    private readonly _presenters: Presenter[],
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {
    if (_playerLimit < 1 || _playerLimit > 100) {
      throw new ValidationError('Player limit must be between 1 and 100');
    }
    if (_presenters.length > 10) {
      throw new ValidationError('Maximum 10 presenters per game');
    }
  }

  get id(): GameId {
    return this._id;
  }

  get creatorId(): string {
    return this._creatorId;
  }

  get playerLimit(): number {
    return this._playerLimit;
  }

  get status(): GameStatus {
    return this._status;
  }

  get presenters(): Presenter[] {
    return [...this._presenters];
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  startAccepting(): void {
    if (this._status.value !== '準備中') {
      throw new InvalidStatusTransitionError('Can only start from 準備中');
    }
    if (this._presenters.length === 0) {
      throw new ValidationError('Cannot start without presenters');
    }
    if (!this.allPresentersHaveCompleteEpisodes()) {
      throw new ValidationError(
        'All presenters must have 3 episodes with lie marked'
      );
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
    return this._presenters.every((p) => p.hasCompleteEpisodes());
  }
}
```

### Step 11: Define Repository Interface

**File**: `src/server/domain/repositories/IGameRepository.ts`

```typescript
import type { Game } from '../entities/Game';
import type { GameId } from '../value-objects/GameId';
import type { GameStatus } from '../value-objects/GameStatus';

export interface IGameRepository {
  findAll(): Promise<Game[]>;
  findByCreator(creatorId: string): Promise<Game[]>;
  findByStatus(status: GameStatus): Promise<Game[]>;
  findById(id: GameId): Promise<Game | null>;
  create(game: Game): Promise<void>;
  update(game: Game): Promise<void>;
  delete(id: GameId): Promise<void>;
}
```

## Phase 2: Infrastructure Layer (Prisma Repository)

### Step 12: Create Prisma Repository

**File**: `src/server/infrastructure/repositories/PrismaGameRepository.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import { Game } from '@/server/domain/entities/Game';
import { Presenter } from '@/server/domain/entities/Presenter';
import { Episode } from '@/server/domain/entities/Episode';
import { GameId } from '@/server/domain/value-objects/GameId';
import { GameStatus } from '@/server/domain/value-objects/GameStatus';

export class PrismaGameRepository implements IGameRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<Game[]> {
    const games = await this.prisma.game.findMany({
      include: { presenters: { include: { episodes: true } } },
    });
    return games.map((g) => this.toDomain(g));
  }

  async findByCreator(creatorId: string): Promise<Game[]> {
    const games = await this.prisma.game.findMany({
      where: { creatorId },
      orderBy: { createdAt: 'desc' },
      include: { presenters: { include: { episodes: true } } },
    });
    return games.map((g) => this.toDomain(g));
  }

  async findByStatus(status: GameStatus): Promise<Game[]> {
    const games = await this.prisma.game.findMany({
      where: { status: status.value },
      include: { presenters: { include: { episodes: true } } },
    });
    return games.map((g) => this.toDomain(g));
  }

  async findById(id: GameId): Promise<Game | null> {
    const game = await this.prisma.game.findUnique({
      where: { id: id.value },
      include: { presenters: { include: { episodes: true } } },
    });
    return game ? this.toDomain(game) : null;
  }

  async create(game: Game): Promise<void> {
    await this.prisma.game.create({
      data: {
        id: game.id.value,
        creatorId: game.creatorId,
        playerLimit: game.playerLimit,
        status: game.status.value,
        createdAt: game.createdAt,
        updatedAt: game.updatedAt,
      },
    });
  }

  async update(game: Game): Promise<void> {
    await this.prisma.game.update({
      where: { id: game.id.value },
      data: {
        playerLimit: game.playerLimit,
        status: game.status.value,
        updatedAt: game.updatedAt,
      },
    });
  }

  async delete(id: GameId): Promise<void> {
    await this.prisma.game.delete({
      where: { id: id.value },
    });
  }

  private toDomain(data: any): Game {
    const presenters = data.presenters.map((p: any) => {
      const episodes = p.episodes.map(
        (e: any) =>
          new Episode(e.id, e.presenterId, e.text, e.isLie, e.createdAt)
      );
      return new Presenter(p.id, p.gameId, p.nickname, episodes, p.createdAt);
    });

    return new Game(
      new GameId(data.id),
      data.creatorId,
      data.playerLimit,
      new GameStatus(data.status),
      presenters,
      data.createdAt,
      data.updatedAt
    );
  }
}
```

### Step 13: Repository Factory with DI

**File**: `src/server/infrastructure/repositories/index.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { InMemoryGameRepository } from './InMemoryGameRepository';
import { PrismaGameRepository } from './PrismaGameRepository';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';

const USE_DATABASE = process.env.USE_DATABASE === 'true';

let prismaInstance: PrismaClient | null = null;

export function getGameRepository(): IGameRepository {
  if (USE_DATABASE) {
    if (!prismaInstance) {
      prismaInstance = new PrismaClient();
    }
    return new PrismaGameRepository(prismaInstance);
  }
  return InMemoryGameRepository.getInstance();
}
```

## Phase 3: Application Layer (Use Cases)

### Step 14: Create Use Cases

**File**: `src/server/application/use-cases/games/CreateGame.ts`

```typescript
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import { Game } from '@/server/domain/entities/Game';
import { GameId } from '@/server/domain/value-objects/GameId';
import { GameStatus } from '@/server/domain/value-objects/GameStatus';

export class CreateGame {
  constructor(private gameRepo: IGameRepository) {}

  async execute(creatorId: string, playerLimit: number): Promise<string> {
    const gameId = GameId.generate();
    const game = new Game(
      gameId,
      creatorId,
      playerLimit,
      new GameStatus('準備中'),
      [],
      new Date(),
      new Date()
    );

    await this.gameRepo.create(game);
    return gameId.value;
  }
}
```

**File**: `src/server/application/use-cases/games/StartAcceptingResponses.ts`

```typescript
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import { GameId } from '@/server/domain/value-objects/GameId';
import { ValidationError } from '@/server/domain/errors/ValidationError';

export class StartAcceptingResponses {
  constructor(private gameRepo: IGameRepository) {}

  async execute(gameId: string, creatorId: string): Promise<void> {
    const game = await this.gameRepo.findById(new GameId(gameId));
    if (!game) {
      throw new ValidationError('Game not found');
    }
    if (game.creatorId !== creatorId) {
      throw new ValidationError('Unauthorized');
    }

    game.startAccepting();
    await this.gameRepo.update(game);
  }
}
```

**File**: `src/server/application/use-cases/games/GetGamesByCreator.ts`

```typescript
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';

export interface GameDto {
  id: string;
  playerLimit: number;
  status: string;
  presenterCount: number;
  createdAt: string;
}

export class GetGamesByCreator {
  constructor(private gameRepo: IGameRepository) {}

  async execute(creatorId: string): Promise<GameDto[]> {
    const games = await this.gameRepo.findByCreator(creatorId);
    return games.map((game) => ({
      id: game.id.value,
      playerLimit: game.playerLimit,
      status: game.status.value,
      presenterCount: game.presenters.length,
      createdAt: game.createdAt.toISOString(),
    }));
  }
}
```

## Phase 4: Presentation Layer (Server Actions)

### Step 15: Create Server Actions

**File**: `src/app/actions/game.ts`

```typescript
'use server';

import { cookies } from 'next/headers';
import { getGameRepository } from '@/server/infrastructure/repositories';
import { CreateGame } from '@/server/application/use-cases/games/CreateGame';
import { StartAcceptingResponses } from '@/server/application/use-cases/games/StartAcceptingResponses';
import { GetGamesByCreator } from '@/server/application/use-cases/games/GetGamesByCreator';
import { CreateGameSchema, StartAcceptingSchema } from '@/server/domain/schemas/gameSchemas';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;
  if (!sessionId) {
    throw new Error('No session found');
  }
  return sessionId;
}

export async function createGameAction(rawInput: unknown) {
  try {
    // Validate input with Zod
    const validatedInput = CreateGameSchema.parse(rawInput);

    const sessionId = await getSessionId();
    const repository = getGameRepository();
    const useCase = new CreateGame(repository);
    const gameId = await useCase.execute(sessionId, validatedInput.playerLimit);

    revalidatePath('/games');
    return { success: true, gameId };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return structured validation errors
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

export async function startAcceptingAction(gameId: string) {
  try {
    const sessionId = await getSessionId();
    const repository = getGameRepository();
    const useCase = new StartAcceptingResponses(repository);
    await useCase.execute(gameId, sessionId);

    revalidatePath('/games');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start game',
    };
  }
}

export async function getGamesAction() {
  try {
    const sessionId = await getSessionId();
    const repository = getGameRepository();
    const useCase = new GetGamesByCreator(repository);
    const games = await useCase.execute(sessionId);

    return { success: true, games };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load games',
      games: [],
    };
  }
}
```

## Phase 5: UI Components

### Step 16: Create Game List Page

**File**: `src/app/games/page.tsx`

```typescript
import { getGamesAction } from '@/app/actions/game';
import { GameList } from '@/components/domain/game/GameList';

export default async function GamesPage() {
  const result = await getGamesAction();

  if (!result.success) {
    return <div>Error: {result.error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ゲーム一覧</h1>
      <GameList games={result.games} />
    </div>
  );
}
```

### Step 17: Create Game List Component

**File**: `src/components/domain/game/GameList.tsx`

```typescript
'use client';

import type { GameDto } from '@/server/application/use-cases/games/GetGamesByCreator';
import { GameCard } from './GameCard';

interface GameListProps {
  games: GameDto[];
}

export function GameList({ games }: GameListProps) {
  if (games.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">まだゲームが作成されていません</p>
        <a
          href="/games/create"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ゲームを作成
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
```

### Step 18: Create Game Card Component

**File**: `src/components/domain/game/GameCard.tsx`

```typescript
'use client';

import type { GameDto } from '@/server/application/use-cases/games/GetGamesByCreator';
import { startAcceptingAction } from '@/app/actions/game';
import { useState } from 'react';

interface GameCardProps {
  game: GameDto;
}

export function GameCard({ game }: GameCardProps) {
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    const result = await startAcceptingAction(game.id);
    if (!result.success) {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{game.id.slice(0, 8)}...</h3>
        <span
          className={`px-2 py-1 text-sm rounded ${
            game.status === '準備中'
              ? 'bg-yellow-100 text-yellow-800'
              : game.status === '出題中'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
          }`}
        >
          {game.status}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2">
        プレイヤー上限: {game.playerLimit}人
      </p>
      <p className="text-sm text-gray-600 mb-4">
        出題者: {game.presenterCount}人
      </p>

      {game.status === '準備中' && (
        <button
          onClick={handleStart}
          disabled={loading || game.presenterCount === 0}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
        >
          {loading ? '処理中...' : '出題開始'}
        </button>
      )}
    </div>
  );
}
```

## Phase 6: Testing

### Step 19: Create Unit Tests

**File**: `tests/unit/domain/Game.test.ts`

```typescript
import { describe, expect, it } from 'vitest';
import { Game } from '@/server/domain/entities/Game';
import { GameId } from '@/server/domain/value-objects/GameId';
import { GameStatus } from '@/server/domain/value-objects/GameStatus';

describe('Game', () => {
  it('should create game in 準備中 status', () => {
    const game = new Game(
      GameId.generate(),
      'creator-123',
      10,
      new GameStatus('準備中'),
      [],
      new Date(),
      new Date()
    );
    expect(game.status.value).toBe('準備中');
  });

  it('should throw error for invalid player limit', () => {
    expect(
      () =>
        new Game(
          GameId.generate(),
          'creator-123',
          0, // Invalid
          new GameStatus('準備中'),
          [],
          new Date(),
          new Date()
        )
    ).toThrow('Player limit must be between 1 and 100');
  });
});
```

### Step 20: Run Tests

```bash
npm run test
```

## Summary

This quickstart implements:

1. ✅ SQLite + Prisma database setup
2. ✅ Domain layer with value objects, entities, and repository interface
3. ✅ Infrastructure layer with Prisma repository implementation
4. ✅ Application layer with use cases
5. ✅ Presentation layer with Server Actions
6. ✅ UI components for game management
7. ✅ Unit tests for domain logic

**Next Steps**: Implement presenter and episode management following the same layered architecture pattern. Use the contracts in `contracts/` directory as reference for API specifications.

**Architecture Compliance**: All layers follow Clean Architecture with dependencies pointing inward (UI → Application → Domain). Domain layer has zero external dependencies and contains all business logic.
