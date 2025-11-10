# Implementation Plan: Game Preparation for Moderators

**Branch**: `002-game-preparation` | **Date**: 2025-11-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-game-preparation/spec.md`

**Note**: This plan incorporates SQLite database (user requirement) and Zod validation (user requirement).

## Summary

This feature enables moderators to create and manage truth-or-lie games with presenters who register episodes (3 per presenter, one marked as a lie). Games progress through three statuses (準備中 → 出題中 → 締切), with full CRUD operations and validation.

**Technical approach**: SQLite with Prisma ORM for persistence, Zod for runtime validation at API boundaries, Clean Architecture with repository pattern, domain-driven design, and Server Actions for API layer.

**Key Definitions**:
- **Complete Presenter**: A presenter who has exactly 3 episodes registered AND exactly 1 episode marked as a lie (required for status transition to 出題中)
- **Moderator vs Creator**: "Moderator" is the user-facing role name; "creatorId" is the technical field name in database/code for the user who created the game

## Technical Context

**Language/Version**: TypeScript 5 with strict mode enabled + Next.js 16.0.1, React 19.2.0
**Primary Dependencies**: Prisma 6.x (ORM), Zod 3.x (runtime validation), nanoid 5.1.6 (ID generation), Tailwind CSS v4 (styling)
**Storage**: SQLite (file-based database via Prisma)
**Testing**: Vitest (unit/integration), Playwright (E2E), Zod schema tests
**Target Platform**: Web (Next.js App Router with Server Components)
**Project Type**: web - Next.js full-stack application
**Performance Goals**: Game list loads in <1s for 50 games, status transitions reflect in <2s, game creation completes in <1 min (SC-001, SC-003, SC-004)
**Constraints**:
- Player limit: 1-100 per game (validated via Zod)
- Presenters: 1-10 per game (validated in domain entity)
- Episodes: Exactly 3 per presenter (validated via CompletePresenterSchema)
- Episode text: 1-1000 characters (validated via Zod schema - critical requirement)
- Typical load: 50 games per moderator
- Concurrent edits: Last-write-wins (no optimistic locking in MVP)
**Scale/Scope**: MVP for 10-50 moderators, up to 50 games per moderator, ~2000 database rows per moderator (games + presenters + episodes)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| **0. Git commit** | ✅ PASS | Will commit after each implementation milestone (Prisma setup, Zod schemas, domain layer, use cases, etc.) |
| **I. Clean Architecture** | ✅ PASS | Game preparation follows strict layering: Domain (Game/Presenter/Episode entities with validation) → Application (CreateGame, AddPresenter use cases) → Infrastructure (PrismaGameRepository) → Presentation (Server Actions with Zod validation) |
| **II. Component Architecture** | ✅ PASS | UI organized as: Pages (game list, game edit) → Domain (GameList, GameCard, PresenterForm) → UI (Button, Input components) |
| **III. Custom Hooks Architecture** | ✅ PASS | Game form logic in useGameForm hook with Zod validation, episode form in useEpisodeForm, all validation logic extracted from components |
| **IV. Test-Driven Development** | ✅ PASS | Will write tests first for Game entity validation, status transitions, Zod schemas, repository operations, use cases |
| **V. Type Safety** | ✅ PASS | TypeScript strict mode enabled, Prisma provides database-to-code type safety, Zod provides runtime type safety with TypeScript inference, value objects for GameId and GameStatus |
| **VI. Documentation Standards** | ✅ PASS | Spec follows Given-When-Then format, all 21 functional requirements traced to acceptance criteria |
| **VII. Server Components First** | ✅ PASS | Game list and detail pages use Server Components with Server Actions, Client Components only for interactive forms (game creation, episode registration) |

### Technology Standards Compliance

| Standard | Status | Notes |
|----------|--------|-------|
| **TypeScript 5 strict mode** | ✅ PASS | Project already configured with strict mode |
| **Next.js App Router** | ✅ PASS | All pages use App Router pattern with Server Components |
| **Prisma ORM** | ✅ PASS | SQLite database with Prisma for type-safe queries and migrations |
| **Zod Validation** | ✅ PASS | Runtime validation at API boundaries with TypeScript type inference |
| **Vitest + Playwright** | ✅ PASS | Unit tests with Vitest, E2E with Playwright, Zod schema tests |
| **Repository Pattern** | ✅ PASS | IGameRepository interface with PrismaGameRepository implementation, supports testing with InMemoryGameRepository |

## Project Structure

### Documentation (this feature)

```text
specs/002-game-preparation/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (includes Zod decision)
├── data-model.md        # Phase 1 output (includes Zod schemas)
├── quickstart.md        # Phase 1 output (includes Zod setup)
├── contracts/           # Phase 1 output (references Zod validation)
│   ├── game-actions.yaml
│   ├── presenter-actions.yaml
│   └── use-case-contracts.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created yet)
```

### Source Code (repository root)

```text
src/
├── app/                          # Next.js App Router
│   ├── actions/
│   │   ├── game.ts              # Server Actions with Zod validation (FR-001, FR-009, FR-010, FR-012, FR-015)
│   │   └── presenter.ts         # Server Actions with Zod validation (FR-003, FR-004, FR-005)
│   ├── games/
│   │   ├── page.tsx             # Game list page (FR-012)
│   │   ├── create/
│   │   │   └── page.tsx         # Game creation page (FR-001, FR-002)
│   │   └── [id]/
│   │       ├── page.tsx         # Game detail/edit page (FR-013, FR-021)
│   │       └── presenters/
│   │           └── page.tsx     # Presenter management (FR-003, FR-004, FR-005)
│   └── layout.tsx               # Root layout
├── components/
│   ├── pages/                   # Page-level components
│   │   ├── GameListPage.tsx
│   │   └── GameEditPage.tsx
│   ├── domain/                  # Feature-specific components
│   │   └── game/
│   │       ├── GameList.tsx     # List of games with status badges
│   │       ├── GameCard.tsx     # Individual game card with actions
│   │       ├── GameForm.tsx     # Game creation/edit form with Zod validation
│   │       ├── PresenterList.tsx
│   │       ├── PresenterForm.tsx
│   │       ├── EpisodeList.tsx
│   │       └── EpisodeForm.tsx
│   └── ui/                      # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       └── Badge.tsx
├── hooks/                       # Custom hooks for client logic with Zod
│   ├── useGameForm.ts          # Game form state with Zod validation
│   ├── usePresenterForm.ts     # Presenter form with Zod validation
│   └── useEpisodeForm.ts       # Episode form with Zod validation
├── server/
│   ├── domain/                  # Domain layer (NO external dependencies except Zod for schemas)
│   │   ├── entities/
│   │   │   ├── Game.ts         # Game aggregate root (FR-001 through FR-021)
│   │   │   ├── Presenter.ts    # Presenter entity (FR-003, FR-004)
│   │   │   └── Episode.ts      # Episode entity (FR-004, FR-005, FR-006)
│   │   ├── value-objects/
│   │   │   ├── GameId.ts       # UUID value object (FR-001)
│   │   │   └── GameStatus.ts   # Status enum (FR-007, FR-008)
│   │   ├── schemas/            # Zod validation schemas (NEW)
│   │   │   ├── gameSchemas.ts  # All validation schemas with Japanese error messages
│   │   │   └── validators.ts   # Complex validation rules (complete presenter, ready to accept)
│   │   ├── repositories/
│   │   │   └── IGameRepository.ts  # Repository interface
│   │   └── errors/
│   │       ├── ValidationError.ts
│   │       └── InvalidStatusTransitionError.ts
│   ├── application/             # Application layer (use cases)
│   │   ├── use-cases/
│   │   │   └── games/
│   │   │       ├── CreateGame.ts              # FR-001, FR-002, FR-008
│   │   │       ├── UpdateGameSettings.ts      # FR-013
│   │   │       ├── DeleteGame.ts              # FR-015, FR-016
│   │   │       ├── StartAcceptingResponses.ts # FR-009, FR-011, FR-018, FR-019
│   │   │       ├── CloseGame.ts               # FR-010
│   │   │       ├── GetGamesByCreator.ts       # FR-012
│   │   │       ├── GetGameDetail.ts           # FR-021
│   │   │       ├── AddPresenter.ts            # FR-003
│   │   │       ├── RemovePresenter.ts         # FR-014
│   │   │       ├── AddEpisode.ts              # FR-004, FR-005
│   │   │       └── GetPresenterEpisodes.ts    # FR-006
│   │   └── dto/
│   │       ├── GameDto.ts
│   │       ├── GameDetailDto.ts
│   │       ├── EpisodeDto.ts               # Public (no isLie)
│   │       └── EpisodeWithLieDto.ts        # Private (with isLie - FR-006)
│   └── infrastructure/          # Infrastructure layer
│       └── repositories/
│           ├── PrismaGameRepository.ts     # Prisma implementation
│           ├── InMemoryGameRepository.ts   # For testing
│           └── index.ts                    # Repository factory with DI
└── types/
    └── game.ts                  # Shared type definitions

prisma/
├── schema.prisma               # Database schema (Game, Presenter, Episode models)
├── migrations/                 # Prisma migration history
└── dev.db                      # SQLite database file

tests/
├── unit/                       # Unit tests (domain layer, use cases, Zod schemas)
│   ├── domain/
│   │   ├── Game.test.ts
│   │   ├── GameId.test.ts
│   │   ├── GameStatus.test.ts
│   │   ├── Presenter.test.ts
│   │   └── Episode.test.ts
│   ├── schemas/                # Zod schema tests (NEW)
│   │   ├── gameSchemas.test.ts
│   │   └── validators.test.ts
│   └── use-cases/
│       ├── CreateGame.test.ts
│       ├── StartAcceptingResponses.test.ts
│       └── GetGamesByCreator.test.ts
├── integration/                # Integration tests (repositories)
│   └── repositories/
│       ├── PrismaGameRepository.test.ts
│       └── InMemoryGameRepository.test.ts
└── e2e/                        # E2E tests (Playwright)
    ├── game-creation.spec.ts
    ├── presenter-management.spec.ts
    └── status-transitions.spec.ts
```

**Structure Decision**: This is a Next.js web application using the App Router pattern. The architecture follows Clean Architecture principles with clear separation:

1. **Domain Layer** (`src/server/domain/`): Pure business logic with entities (Game, Presenter, Episode), value objects (GameId, GameStatus), repository interfaces, and **Zod validation schemas** for type-safe runtime validation.

2. **Application Layer** (`src/server/application/`): Use cases orchestrate domain entities. DTOs handle data transfer with proper security (EpisodeDto vs EpisodeWithLieDto for FR-006).

3. **Infrastructure Layer** (`src/server/infrastructure/`): Concrete implementations of repositories. PrismaGameRepository for production, InMemoryGameRepository for testing.

4. **Presentation Layer** (`src/app/`, `src/components/`): Next.js App Router with Server Components and Server Actions. **All Server Actions validate input with Zod before executing use cases**. Client Components use custom hooks with Zod for form validation.

**Zod Integration Points**:
- **Server Actions**: Validate all inputs at API boundary (parse with Zod, return structured errors)
- **Custom Hooks**: Validate form inputs client-side (same Zod schemas, same error messages)
- **Use Cases**: Receive pre-validated data from Server Actions
- **Tests**: Independently test Zod schemas for all validation rules

**Authorization & Error Handling**:
- **Game Creator Authorization**: Only the user who created a game (creatorId === sessionId) can edit, delete, or change status
- **Presenter Authorization**: Presenters can manage their own episodes; game creators can manage all episodes in their games
- **Presenter Lookup**: When adding a presenter by nickname, system validates nickname exists in session system and returns NotFoundError if invalid
- **Lie Marker Security**: isLie field NEVER exposed in public DTOs (EpisodeDto); only in private DTOs (EpisodeWithLieDto) with access control

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: ✅ NO VIOLATIONS

All constitution principles are satisfied. The architecture uses established patterns (Clean Architecture, Repository Pattern, Custom Hooks, Zod Validation) that are justified by:

- **Repository Pattern**: Required for Clean Architecture compliance and testability (allows InMemory substitution in tests)
- **Prisma ORM**: Provides type safety and migration management, aligns with Type Safety principle (V)
- **Zod Validation**: User requirement - provides runtime type safety, single source of truth for validation rules, TypeScript type inference
- **Three-layer architecture**: Standard Clean Architecture pattern, not excessive for domain complexity
- **Value Objects**: Domain-Driven Design best practice for validation and type safety

No additional complexity beyond constitutional requirements.

## Implementation Phases

### Phase 0: Setup (Completed in research.md + quickstart.md)
- SQLite + Prisma setup with migrations
- Zod installation and schema definitions
- Repository factory with dependency injection

### Phase 1: Core Domain (To be implemented in /speckit.tasks)
- Value objects (GameId, GameStatus) with Zod schemas
- Domain entities (Game, Presenter, Episode) with business logic
- Domain errors and validation
- Zod validation schemas for all inputs

### Phase 2: Infrastructure (To be implemented in /speckit.tasks)
- PrismaGameRepository implementation
- InMemoryGameRepository for testing
- Repository tests (unit + integration)

### Phase 3: Application Layer (To be implemented in /speckit.tasks)
- Use cases for all functional requirements (FR-001 through FR-021)
- DTOs with security boundaries (EpisodeDto vs EpisodeWithLieDto)
- Use case tests with Zod validation

### Phase 4: Presentation Layer (To be implemented in /speckit.tasks)
- Server Actions with Zod validation at boundaries
- Custom hooks with Zod for client-side validation
- UI components (Pages/Domain/UI architecture)
- E2E tests for full workflows

All implementation steps will be generated in `tasks.md` via `/speckit.tasks` command.
