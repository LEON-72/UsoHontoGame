import type { GameSessionV2 } from '@/server/domain-v2/entities/GameSessionV2';
import type { IGameSessionRepositoryV2 } from '@/server/domain-v2/repositories/IGameSessionRepositoryV2';

/**
 * In-memory implementation of GameSessionRepositoryV2
 * Uses singleton pattern to maintain state across requests
 * Auto-cleanup after 24 hours of inactivity
 */
export class InMemoryGameSessionRepositoryV2 implements IGameSessionRepositoryV2 {
  private static instance: InMemoryGameSessionRepositoryV2;
  private sessions: Map<string, GameSessionV2> = new Map();

  private constructor() {
    // Start cleanup interval for stale sessions (every hour)
    this.startCleanupInterval();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): InMemoryGameSessionRepositoryV2 {
    if (!InMemoryGameSessionRepositoryV2.instance) {
      InMemoryGameSessionRepositoryV2.instance = new InMemoryGameSessionRepositoryV2();
    }
    return InMemoryGameSessionRepositoryV2.instance;
  }

  /**
   * Start periodic cleanup of stale sessions (24 hours old)
   */
  private startCleanupInterval(): void {
    const ONE_HOUR = 60 * 60 * 1000;
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    setInterval(() => {
      const now = Date.now();
      for (const [id, session] of this.sessions.entries()) {
        const timeSinceCreation = now - session.createdAt.getTime();
        if (timeSinceCreation > TWENTY_FOUR_HOURS) {
          this.sessions.delete(id);
        }
      }
    }, ONE_HOUR);
  }

  async create(session: GameSessionV2): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async findById(id: string): Promise<GameSessionV2 | null> {
    return this.sessions.get(id) || null;
  }

  async exists(id: string): Promise<boolean> {
    return this.sessions.has(id);
  }

  async update(session: GameSessionV2): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async delete(id: string): Promise<void> {
    this.sessions.delete(id);
  }

  async findAll(): Promise<GameSessionV2[]> {
    return Array.from(this.sessions.values());
  }

  /**
   * Clear all sessions (for testing only)
   */
  clearAll(): void {
    this.sessions.clear();
  }
}
