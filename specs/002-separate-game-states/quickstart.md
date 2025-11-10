# Quickstart: Separate Game Creation and Start States

**Feature**: 002-separate-game-states | **Branch**: `002-separate-game-states`

## Overview

This feature separates game creation and game start into distinct states, allowing hosts to create and configure games before starting them. Key additions include episode registration, toast notifications with session IDs, and host-specific management access.

## Prerequisites

- Node.js 18+ and npm installed
- Next.js development environment set up
- TypeScript 5 with strict mode enabled

## Quick Setup

```bash
# Switch to feature branch
git checkout 002-separate-game-states

# Install dependencies (if any new ones)
npm install

# Run tests to verify setup
npm test

# Start development server
npm run dev
```

## Key Components

### 1. Game Creation Flow

**Location**: `src/components/pages/CreatePage/`

Creates a new game session with episodes:

```typescript
// Example usage in CreatePage component
import { useGameCreation } from '@/hooks/useGameCreation';

function CreatePage() {
  const { createGame, isCreating } = useGameCreation();

  const handleSubmit = async (episodes: Episode[]) => {
    const result = await createGame(episodes);
    // Automatically redirects to /join on success
    // Toast shows session ID
  };
}
```

### 2. Toast Notifications

**Location**: `src/components/ui/Toast/`

Displays success messages with session ID:

```typescript
// Toast will automatically appear after game creation
// Minimum display time: 5 seconds
// Contains session ID for sharing
```

### 3. Host Management Link

**Location**: `src/components/domain/host/HostLink/`

Conditional link shown only to hosts on Join Page:

```typescript
// Automatically checks host permissions
// Only visible if user created the session
// Links to /host/[sessionId]
```

## API Endpoints

### Create Game Session
```http
POST /api/sessions
Content-Type: application/json

{
  "episodes": [
    { "content": "Episode 1 text" },
    { "content": "Episode 2 text" }
  ]
}

Response:
{
  "success": true,
  "data": {
    "sessionId": "xK9mP2nQ7R",
    "message": "ゲームセッションが正常に作成されました"
  }
}
```

### Check Host Access
```http
GET /api/sessions/{sessionId}/host-access

Response:
{
  "success": true,
  "data": {
    "isHost": true,
    "sessionId": "xK9mP2nQ7R"
  }
}
```

## Testing

### Run All Tests
```bash
npm test
```

### Test Specific Features
```bash
# Test game creation
npm test CreatePage

# Test toast notifications
npm test Toast

# Test host permissions
npm test HostLink

# Test API endpoints
npm test sessions.test
```

### Manual Testing Steps

1. **Create a Game**:
   - Navigate to `/create`
   - Enter 1-20 episodes
   - Click "登録" button
   - Verify toast appears with session ID
   - Verify redirect to `/join`

2. **Verify Host Access**:
   - As host, go to `/join`
   - Look for "Host Management" link
   - Click link to access `/host/[sessionId]`

3. **Verify Non-Host Access**:
   - Open incognito/different browser
   - Navigate to `/join` with same session
   - Verify no "Host Management" link appears

## State Management

Game sessions have three distinct states:

```typescript
enum GameState {
  CREATED = "created",  // After creation, before start
  STARTED = "started",  // Game in progress
  ENDED = "ended"      // Game completed
}
```

## File Structure

```
src/
├── app/
│   ├── api/sessions/          # API routes
│   ├── (pages)/
│   │   ├── create/            # Game creation page
│   │   ├── join/              # Join page with host link
│   │   └── host/              # Host management page
├── components/
│   ├── pages/
│   │   ├── CreatePage/        # Creation page component
│   │   ├── JoinPage/          # Join page component
│   │   └── HostManagementPage/
│   ├── domain/
│   │   ├── game/
│   │   │   ├── EpisodeForm/  # Episode input form
│   │   │   └── SessionInfo/  # Session display
│   │   └── host/
│   │       └── HostLink/     # Conditional host link
│   └── ui/
│       └── Toast/             # Toast notifications
├── hooks/
│   ├── useGameCreation.ts    # Game creation logic
│   ├── useToast.ts           # Toast management
│   └── useHostAccess.ts      # Host permission check
├── server/
│   ├── domain/               # Entities and interfaces
│   ├── application/          # Use cases
│   └── infrastructure/       # Repositories
└── types/
    ├── session.ts            # Session types
    └── episode.ts            # Episode types
```

## Common Issues & Solutions

### Toast Not Appearing
- Check that toast context provider wraps the app
- Verify toast hook is properly imported
- Check browser console for errors

### Host Link Not Visible
- Verify cookies are enabled in browser
- Check that you're the actual host (created the game)
- Clear browser cache and recreate game

### Session Not Found
- Sessions expire after 24 hours
- Check session ID format (10 characters)
- Verify server is running

## Development Tips

1. **Use TDD Approach**:
   - Write tests first
   - Implement minimum code to pass
   - Refactor while keeping tests green

2. **Follow Clean Architecture**:
   - Keep business logic in use cases
   - Components only handle presentation
   - All logic in custom hooks

3. **Type Safety**:
   - Define all types explicitly
   - No `any` types
   - Use DTOs for API communication

## Next Steps

After implementation, you can:
1. Test the complete flow end-to-end
2. Add more episode management features
3. Implement game start functionality
4. Add real-time updates for players

## Support

For issues or questions:
- Check test files for usage examples
- Review type definitions in `src/types/`
- Consult the implementation plan in `specs/002-separate-game-states/plan.md`