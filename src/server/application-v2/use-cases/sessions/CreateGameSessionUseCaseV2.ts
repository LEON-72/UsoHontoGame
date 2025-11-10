import { GameSessionV2, type Episode } from '@/server/domain-v2/entities/GameSessionV2';
import type { IGameSessionRepositoryV2 } from '@/server/domain-v2/repositories/IGameSessionRepositoryV2';
import { generateSessionId } from '@/server/application/services/SessionIdGenerator';
import { GameState } from '@/types/session';

/**
 * Input DTO for CreateGameSessionUseCaseV2
 */
export interface CreateGameSessionInputV2 {
  episodes: {
    content: string;
  }[];
}

/**
 * Output DTO for CreateGameSessionUseCaseV2
 */
export interface CreateGameSessionOutputV2 {
  sessionId: string;
  state: string;
  episodeCount: number;
  message: string;
}

/**
 * Use Case: Create a new game session with episodes
 * This is the entry point for the new game creation flow
 */
export class CreateGameSessionUseCaseV2 {
  constructor(private readonly repository: IGameSessionRepositoryV2) {}

  async execute(input: CreateGameSessionInputV2): Promise<CreateGameSessionOutputV2> {
    // Validate episode count
    if (input.episodes.length < 1 || input.episodes.length > 20) {
      throw new Error('Episode count must be between 1 and 20');
    }

    // Validate and prepare episodes
    const episodes: Episode[] = input.episodes.map((episode, index) => {
      const trimmedContent = episode.content.trim();

      if (trimmedContent.length === 0) {
        throw new Error('Episode content cannot be empty');
      }

      return {
        id: crypto.randomUUID(),
        content: trimmedContent,
        order: index + 1,
        createdAt: new Date(),
      };
    });

    // Generate unique session ID
    const sessionId = generateSessionId();

    // TODO: In a real implementation, we would get the hostId from authentication
    // For MVP, we'll generate a temporary one
    const hostId = crypto.randomUUID();

    // Create game session entity
    const session = GameSessionV2.create(sessionId, hostId, episodes);

    // Persist to repository
    await this.repository.create(session);

    return {
      sessionId: session.id,
      state: GameState.CREATED,
      episodeCount: episodes.length,
      message: `Game session created successfully with ${episodes.length} episode(s). Session ID: ${sessionId}`,
    };
  }
}
