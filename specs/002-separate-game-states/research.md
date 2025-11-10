# Research & Decisions: Separate Game Creation and Start States

**Feature**: 002-separate-game-states | **Date**: 2025-11-09

## Research Tasks Completed

### 1. State Management Pattern for Game Sessions

**Decision**: Use React Context API with custom hooks for client-side state, backed by Next.js API routes
**Rationale**:
- Aligns with existing codebase patterns
- Provides real-time updates without external dependencies
- Custom hooks enforce separation of logic from components (constitution requirement)
**Alternatives considered**:
- Redux: Too heavyweight for current scope
- Zustand: Not necessary given simple state requirements
- Server-only state: Would require constant API calls, poor UX

### 2. Session ID Generation Strategy

**Decision**: Use nanoid (already in dependencies) with 10-character alphanumeric IDs
**Rationale**:
- Already installed in project dependencies
- Provides sufficient uniqueness (60^10 combinations)
- Human-readable and shareable format
- URL-safe characters by default
**Alternatives considered**:
- UUID v4: Too long for users to share easily (36 characters)
- Sequential IDs: Security risk, predictable
- Custom algorithm: Unnecessary complexity

### 3. Toast Notification Implementation

**Decision**: Custom Toast component with React Portal and Context
**Rationale**:
- Full control over styling and behavior
- No additional dependencies needed
- Can ensure 5-second minimum display time
- Integrates with Tailwind CSS v4
**Alternatives considered**:
- react-hot-toast: External dependency, might not match design requirements
- react-toastify: Heavier than needed
- Browser notifications: Not appropriate for in-app messages

### 4. Host Permission Management

**Decision**: Session-based host identification using cookies/localStorage
**Rationale**:
- Simple implementation for MVP
- No user authentication system required yet
- Can migrate to proper auth later
- Works with Server Components via cookies
**Alternatives considered**:
- JWT tokens: Overengineered for current needs
- URL parameters: Security risk, easily shared
- Database sessions: Requires persistence layer not yet implemented

### 5. Episode Data Structure

**Decision**: Simple array of episode objects with text content and metadata
**Rationale**:
- Matches game requirements (1-20 episodes)
- Easy to validate and manipulate
- Can extend with additional fields later
- Works well with form arrays in React
**Alternatives considered**:
- Normalized relational structure: Unnecessary complexity for MVP
- Single text field with delimiters: Poor UX, error-prone
- File upload: Not required by specification

### 6. Navigation Flow Pattern

**Decision**: Use Next.js App Router navigation with router.push() and redirect()
**Rationale**:
- Native to Next.js 15
- Supports both client and server navigation
- Maintains browser history properly
- Works with Server Components
**Alternatives considered**:
- window.location: Breaks SPA experience
- Custom routing: Unnecessary when App Router provides everything needed
- Modal-based flow: Poor mobile experience

### 7. Data Persistence Strategy (MVP)

**Decision**: In-memory Map on server with automatic cleanup after 24 hours
**Rationale**:
- Fastest implementation for MVP
- No database setup required
- Meets 24-hour retention requirement
- Easy to replace with proper persistence later
**Alternatives considered**:
- SQLite: Requires database setup and migrations
- Redis: External dependency for MVP
- File system: Scaling and concurrency issues

## Technical Standards Established

1. **API Response Format**:
   ```typescript
   {
     success: boolean;
     data?: any;
     error?: { message: string; code: string };
   }
   ```

2. **Session ID Format**: 10-character nanoid (e.g., "xK9mP2nQ7R")

3. **Toast Display Duration**: Minimum 5 seconds, dismissible after 3 seconds

4. **Episode Limits**: Minimum 1, Maximum 20 episodes per game

5. **Host Cookie Name**: `game_host_${sessionId}` with httpOnly and secure flags

## Integration Points Identified

1. **Existing Toast System**: Check if any toast component exists in `src/components/ui/`
2. **Navigation Hooks**: Verify existing navigation patterns in `src/hooks/`
3. **API Structure**: Follow existing patterns in `src/app/api/`
4. **Type Definitions**: Extend types in `src/types/`

## Risk Mitigations

1. **Session ID Collisions**: Check for existing ID before creation, regenerate if needed
2. **Memory Leaks**: Implement cleanup timer for expired sessions
3. **Navigation Errors**: Wrap navigation in try-catch, show user-friendly errors
4. **Toast Overflow**: Queue system if multiple toasts, display one at a time
5. **Host Spoofing**: Validate host cookie on server for each request

## Next Steps

With all technical decisions made and no remaining clarifications needed, proceed to Phase 1:
- Generate data model
- Create API contracts
- Prepare quickstart documentation