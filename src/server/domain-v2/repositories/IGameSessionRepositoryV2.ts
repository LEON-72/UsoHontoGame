import type { GameSessionV2 } from '../entities/GameSessionV2';

/**
 * Repository interface for GameSessionV2 operations
 * Provides data access abstraction for game sessions in the new flow
 */
export interface IGameSessionRepositoryV2 {
  /**
   * Create and save a new game session
   */
  create(session: GameSessionV2): Promise<void>;

  /**
   * Find a game session by ID
   */
  findById(id: string): Promise<GameSessionV2 | null>;

  /**
   * Check if a session exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Update an existing game session
   */
  update(session: GameSessionV2): Promise<void>;

  /**
   * Delete a game session by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Find all sessions (for cleanup operations)
   */
  findAll(): Promise<GameSessionV2[]>;
}
