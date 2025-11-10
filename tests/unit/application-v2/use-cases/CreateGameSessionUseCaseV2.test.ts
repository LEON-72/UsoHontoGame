import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateGameSessionUseCaseV2 } from '@/server/application-v2/use-cases/sessions/CreateGameSessionUseCaseV2';
import { InMemoryGameSessionRepositoryV2 } from '@/server/infrastructure-v2/repositories/InMemoryGameSessionRepositoryV2';

// Mock the generateSessionId function
vi.mock('@/server/application/services/SessionIdGenerator', () => ({
  generateSessionId: () => 'TEST123',
}));

describe('CreateGameSessionUseCaseV2', () => {
  let useCase: CreateGameSessionUseCaseV2;
  let repository: InMemoryGameSessionRepositoryV2;

  beforeEach(() => {
    repository = InMemoryGameSessionRepositoryV2.getInstance();
    repository.clearAll();
    useCase = new CreateGameSessionUseCaseV2(repository);
  });

  describe('execute', () => {
    it('should create a game session with episodes', async () => {
      const episodes = [
        { content: 'Episode 1' },
        { content: 'Episode 2' },
        { content: 'Episode 3' },
      ];

      const result = await useCase.execute({ episodes });

      expect(result.sessionId).toBe('TEST123');
      expect(result.state).toBe('created');
      expect(result.episodeCount).toBe(3);
      expect(result.message).toContain('Game session created successfully');
    });

    it('should persist the session to the repository', async () => {
      const episodes = [{ content: 'Episode 1' }];

      await useCase.execute({ episodes });

      const saved = await repository.findById('TEST123');
      expect(saved).toBeDefined();
      expect(saved?.id).toBe('TEST123');
      expect(saved?.episodes).toHaveLength(1);
    });

    it('should throw error when episode count is less than 1', async () => {
      await expect(useCase.execute({ episodes: [] })).rejects.toThrow(
        'Episode count must be between 1 and 20'
      );
    });

    it('should throw error when episode count is more than 20', async () => {
      const tooManyEpisodes = Array.from({ length: 21 }, (_, i) => ({
        content: `Episode ${i + 1}`,
      }));

      await expect(useCase.execute({ episodes: tooManyEpisodes })).rejects.toThrow(
        'Episode count must be between 1 and 20'
      );
    });

    it('should throw error when episode content is empty', async () => {
      const episodes = [{ content: '' }];

      await expect(useCase.execute({ episodes })).rejects.toThrow('Episode content cannot be empty');
    });

    it('should throw error when episode content is only whitespace', async () => {
      const episodes = [{ content: '   ' }];

      await expect(useCase.execute({ episodes })).rejects.toThrow('Episode content cannot be empty');
    });

    it('should accept exactly 1 episode', async () => {
      const episodes = [{ content: 'Single episode' }];

      const result = await useCase.execute({ episodes });

      expect(result.episodeCount).toBe(1);
    });

    it('should accept exactly 20 episodes', async () => {
      const episodes = Array.from({ length: 20 }, (_, i) => ({
        content: `Episode ${i + 1}`,
      }));

      const result = await useCase.execute({ episodes });

      expect(result.episodeCount).toBe(20);
    });

    it('should trim whitespace from episode content', async () => {
      const episodes = [{ content: '  Episode with spaces  ' }];

      await useCase.execute({ episodes });

      const saved = await repository.findById('TEST123');
      expect(saved?.episodes[0].content).toBe('Episode with spaces');
    });

    it('should assign sequential order numbers to episodes', async () => {
      const episodes = [{ content: 'First' }, { content: 'Second' }, { content: 'Third' }];

      await useCase.execute({ episodes });

      const saved = await repository.findById('TEST123');
      expect(saved?.episodes[0].order).toBe(1);
      expect(saved?.episodes[1].order).toBe(2);
      expect(saved?.episodes[2].order).toBe(3);
    });

    it('should generate unique IDs for each episode', async () => {
      const episodes = [{ content: 'First' }, { content: 'Second' }];

      await useCase.execute({ episodes });

      const saved = await repository.findById('TEST123');
      const ids = saved?.episodes.map(e => e.id) || [];
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(2);
    });
  });
});
