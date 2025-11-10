# Implementation Plan: Separate Game Creation and Start States

**Branch**: `002-separate-game-states` | **Date**: 2025-11-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-separate-game-states/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement separation of game creation and game start states to allow hosts to create and configure games before starting them. This includes episode registration during creation, toast notifications with session IDs, and host-specific management access from the Join Page.

## Technical Context

**Language/Version**: TypeScript 5 with strict mode enabled
**Primary Dependencies**: Next.js 15, React 19, Tailwind CSS v4
**Storage**: In-memory for MVP (will need persistence layer later)
**Testing**: Vitest for unit/integration, React Testing Library for components
**Target Platform**: Web browser (desktop and mobile responsive)
**Project Type**: Web application with server-side rendering
**Performance Goals**: Game creation under 3 seconds, page transitions under 500ms
**Constraints**: Toast notification visible for at least 5 seconds, support 1-20 episodes per game
**Scale/Scope**: Initial support for 100 concurrent game sessions, 10 players per game

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

- ✅ **Clean Architecture**: Backend will follow strict layer separation (API Routes → Use Cases → Domain → Infrastructure)
- ✅ **Component Architecture**: Frontend will use three-layer hierarchy (Pages → Domain → UI)
- ✅ **Custom Hooks Architecture**: All component logic will be in custom hooks
- ✅ **Test-Driven Development**: All implementation will follow TDD (Red-Green-Refactor)
- ✅ **Type Safety**: TypeScript strict mode already enabled
- ✅ **Documentation Standards**: Feature spec references requirements and user stories
- ✅ **Server Components First**: Will leverage RSC for data fetching where possible

### Technology Stack Compliance

- ✅ Using Next.js 15 with App Router
- ✅ Using React 19 with Server Components
- ✅ TypeScript 5 with strict mode
- ✅ Tailwind CSS v4 for styling
- ✅ Vitest and React Testing Library for testing

**Verdict**: ✅ PASS - No constitution violations

## Project Structure

### Documentation (this feature)

```text
specs/002-separate-game-states/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/                         # Next.js App Router
│   ├── api/                    # API Routes (Presentation Layer)
│   │   └── sessions/           # Game session endpoints
│   └── (pages)/                # Page routes
│       ├── create/             # Game creation page
│       ├── join/               # Join page with host link
│       └── host/               # Host management page
├── components/                  # UI Components
│   ├── pages/                 # Page-level components
│   │   ├── CreatePage/        # Game creation page component
│   │   ├── JoinPage/          # Join page component
│   │   └── HostManagementPage/ # Host management component
│   ├── domain/                 # Domain-specific components
│   │   ├── game/              # Game-related components
│   │   │   ├── EpisodeForm/   # Episode registration form
│   │   │   └── SessionInfo/   # Session ID display
│   │   └── host/              # Host-specific components
│   │       └── HostLink/      # Conditional host link
│   └── ui/                     # Reusable UI components
│       └── Toast/             # Toast notification component
├── server/                      # Backend (Clean Architecture)
│   ├── domain/                # Domain Layer
│   │   ├── entities/          # GameSession, Episode, Host
│   │   └── repositories/      # Repository interfaces
│   ├── application/           # Application Layer
│   │   └── use-cases/        # Create/manage session use cases
│   └── infrastructure/        # Infrastructure Layer
│       └── repositories/      # In-memory implementations
├── hooks/                       # Custom React hooks
│   ├── useGameCreation.ts     # Game creation logic
│   ├── useToast.ts            # Toast notification hook
│   └── useHostAccess.ts       # Host permission check
└── types/                       # TypeScript type definitions
    ├── session.ts              # Game session types
    └── episode.ts              # Episode types
```

**Structure Decision**: Following the existing Next.js App Router structure with Clean Architecture for backend and three-layer component architecture for frontend, as mandated by the constitution.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations - this section is not applicable*

## Post-Design Constitution Re-evaluation

**Date**: 2025-11-09 | **Status**: ✅ PASS

### Design Artifacts Compliance Check

- ✅ **Data Model**: Follows domain-driven design with clear entities, value objects, and aggregates
- ✅ **API Contracts**: RESTful design with proper HTTP verbs and status codes
- ✅ **Clean Architecture**: Maintained strict layer separation in all designs:
  - API routes handle only HTTP concerns
  - Use cases contain business logic
  - Domain entities are framework-agnostic
  - Repository interfaces abstract data access
- ✅ **Component Architecture**: Design maintains three-layer hierarchy
- ✅ **Custom Hooks**: All component logic designed for custom hooks
- ✅ **Type Safety**: All interfaces and types fully defined
- ✅ **TDD Approach**: API contracts and data model designed for testability

### Technology Decisions Alignment

- ✅ **React Context + Hooks**: Aligns with custom hooks requirement
- ✅ **Server Components**: Designed for RSC where applicable
- ✅ **In-memory Storage**: Appropriate for MVP, follows repository pattern for easy migration
- ✅ **Toast with Portal**: Follows React best practices
- ✅ **nanoid**: Minimal dependency, already in project

**Final Verdict**: All design decisions comply with the constitution. No violations identified. Ready for task generation phase (`/speckit.tasks`).