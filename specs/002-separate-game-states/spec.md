# Feature Specification: Separate Game Creation and Start States

**Feature Branch**: `002-separate-game-states`
**Created**: 2025-11-09
**Status**: Draft
**Input**: User description: "ゲームを作成してからゲームを開始するまでの仕様を変更します。ゲームの作成とゲームの開始は全く別のstateとして扱います。まずはゲームの作成について仕様を変更します。ゲームの作成画面でエピソードを登録してから「登録ボタン」を押すと登録が成功した旨のメッセージをセッションIDをToastで表示してJoinPageに遷移します。また、作成したゲームが確認できるようにホストの場合にはJoinPageからHostManagementPageに遷移するためのリンクを追加します。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Game Creation with Episode Registration (Priority: P1)

As a game host, I want to create a new game session by registering episodes and receive confirmation of successful creation with the session ID, so that I can share the session with players.

**Why this priority**: This is the fundamental flow for creating games. Without this, no games can be created or played.

**Independent Test**: Can be fully tested by creating a game with episodes, receiving the session ID in a toast notification, and being redirected to the Join Page.

**Acceptance Scenarios**:

1. **Given** I am on the game creation page, **When** I enter one or more episodes and click the "登録" (Register) button, **Then** I see a toast notification displaying the successful registration message with the session ID
2. **Given** I have successfully created a game, **When** the registration is complete, **Then** I am automatically redirected to the Join Page
3. **Given** I am creating a game with multiple episodes, **When** I click the register button, **Then** all episodes are saved with the game session

---

### User Story 2 - Host Management Access from Join Page (Priority: P2)

As a game host, I want to access a management page from the Join Page to view and manage my created game, so that I can control the game session before starting it.

**Why this priority**: Hosts need to manage their created games before starting them. This provides essential control over the game session.

**Independent Test**: Can be tested by verifying that hosts see a link to the Host Management Page on the Join Page, and that clicking it navigates to the management interface.

**Acceptance Scenarios**:

1. **Given** I am a host who has created a game and I'm on the Join Page, **When** I view the page, **Then** I see a link to access the Host Management Page
2. **Given** I am a host on the Join Page, **When** I click the Host Management link, **Then** I am navigated to the Host Management Page
3. **Given** I am a regular player (not a host) on the Join Page, **When** I view the page, **Then** I do not see the Host Management link

---

### User Story 3 - Separate Game Creation and Start States (Priority: P1)

The system must maintain game creation and game start as completely separate states, allowing hosts to prepare games without immediately starting them.

**Why this priority**: This architectural separation is critical for the new workflow where games can be created, configured, and then started at a later time.

**Independent Test**: Can be tested by creating a game and verifying it remains in "created" state without automatically starting, and that starting the game is a separate action.

**Acceptance Scenarios**:

1. **Given** I have created a new game, **When** the creation is complete, **Then** the game is in "created" state, not "started" state
2. **Given** I have a created game, **When** players join via the session ID, **Then** they can join but the game does not automatically start
3. **Given** I am a host with a created game, **When** I access the Host Management Page, **Then** I have explicit control to start the game when ready

---

### Edge Cases

- What happens when the registration button is clicked without any episodes entered?
- How does the system handle duplicate session IDs?
- What happens if the host navigates away during game creation?
- How does the system handle network errors during registration?
- What is the maximum number of episodes that can be registered?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST treat game creation and game start as completely separate states
- **FR-002**: System MUST allow hosts to register episodes during game creation
- **FR-003**: System MUST display a toast notification with success message and session ID upon successful game registration
- **FR-004**: System MUST automatically redirect to Join Page after successful game creation
- **FR-005**: System MUST provide a link to Host Management Page on Join Page for users who are hosts
- **FR-006**: System MUST only show Host Management link to users who created the game session
- **FR-007**: System MUST generate a unique session ID for each created game
- **FR-008**: System MUST persist game state between creation and start
- **FR-009**: System MUST maintain episode data from creation through game start
- **FR-010**: System MUST allow hosts to access their created games before starting them

### Key Entities

- **Game Session**: Represents a created game with unique session ID, creation timestamp, host identifier, and current state (created/started/ended)
- **Episode**: Content registered during game creation, associated with a game session
- **Host**: User who creates and manages a game session, with special permissions for game control
- **Player**: User who joins an existing game session using the session ID

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Game hosts can create a game and receive session ID confirmation within 3 seconds of clicking register
- **SC-002**: 100% of successfully created games display the session ID in a toast notification
- **SC-003**: Hosts can access the Host Management Page within 2 clicks from the Join Page
- **SC-004**: Game creation and game start are tracked as distinct events in the system
- **SC-005**: 95% of hosts successfully navigate from game creation to Host Management without errors
- **SC-006**: The system supports creating games with 1-20 episodes without performance degradation
- **SC-007**: Created games remain accessible for at least 24 hours before automatic cleanup

## Assumptions *(optional)*

- Users understand the distinction between creating a game and starting a game
- The toast notification duration is sufficient for users to read and note the session ID
- Hosts will want to review or configure their game before starting it
- The session ID format is user-friendly enough to share with other players
- Network connectivity is stable during the game creation process

## Dependencies *(optional)*

- Toast notification system must be available for displaying messages
- Navigation system must support redirects between pages
- User authentication or session management to identify hosts
- Unique ID generation mechanism for session IDs

## Scope Boundaries *(mandatory)*

### In Scope

- Separating game creation and game start into distinct states
- Episode registration during game creation
- Toast notification with session ID upon successful creation
- Automatic navigation to Join Page after creation
- Host-specific link to Host Management Page from Join Page

### Out of Scope

- Game start functionality (will be addressed separately)
- Player joining mechanisms
- Episode editing after game creation
- Game deletion or cancellation features
- Detailed Host Management Page functionality
- Real-time updates to other players
- Game history or analytics