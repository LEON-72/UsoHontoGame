import { GameState } from '@/types/session';

/**
 * Episode entity for GameSessionV2
 * Represents a game prompt/scenario entered by the host during game creation
 */
export interface Episode {
  id: string;
  content: string;
  order: number;
  createdAt: Date;
}

/**
 * GameSessionV2 Entity - Root aggregate for the new game creation flow
 * Represents a game session with episodes entered by the host
 *
 * Key differences from existing GameSession:
 * - Episodes are game-level prompts (not participant episodes)
 * - State management: CREATED -> STARTED -> ENDED
 * - Immutable after creation (episodes cannot be modified)
 */
export class GameSessionV2 {
  private constructor(
    public readonly id: string,
    public readonly hostId: string,
    public readonly createdAt: Date,
    private _state: GameState,
    private _episodes: readonly Episode[],
    private _startedAt?: Date,
    private _endedAt?: Date
  ) {}

  /**
   * Static factory method to create a new GameSession
   * Validates episode count (1-20) and initializes in CREATED state
   */
  static create(sessionId: string, hostId: string, episodes: Episode[]): GameSessionV2 {
    // Validate episode count
    if (episodes.length < 1 || episodes.length > 20) {
      throw new Error('Episode count must be between 1 and 20');
    }

    return new GameSessionV2(
      sessionId,
      hostId,
      new Date(),
      GameState.CREATED,
      Object.freeze([...episodes]) // Freeze to ensure immutability
    );
  }

  /**
   * Get current state
   */
  get state(): GameState {
    return this._state;
  }

  /**
   * Get episodes (immutable)
   */
  get episodes(): readonly Episode[] {
    return this._episodes;
  }

  /**
   * Get started timestamp
   */
  get startedAt(): Date | undefined {
    return this._startedAt;
  }

  /**
   * Get ended timestamp
   */
  get endedAt(): Date | undefined {
    return this._endedAt;
  }

  /**
   * Start the game (transition from CREATED to STARTED)
   */
  start(): void {
    if (this._state === GameState.STARTED || this._state === GameState.ENDED) {
      throw new Error('Game has already been started');
    }

    this._state = GameState.STARTED;
    this._startedAt = new Date();
  }

  /**
   * End the game (transition from STARTED to ENDED)
   */
  end(): void {
    if (this._state === GameState.CREATED) {
      throw new Error('Cannot end a game that has not been started');
    }

    if (this._state === GameState.ENDED) {
      throw new Error('Game has already been ended');
    }

    this._state = GameState.ENDED;
    this._endedAt = new Date();
  }

  /**
   * Check if game is in CREATED state
   */
  isCreated(): boolean {
    return this._state === GameState.CREATED;
  }

  /**
   * Check if game is in STARTED state
   */
  isStarted(): boolean {
    return this._state === GameState.STARTED;
  }

  /**
   * Check if game is in ENDED state
   */
  isEnded(): boolean {
    return this._state === GameState.ENDED;
  }
}
