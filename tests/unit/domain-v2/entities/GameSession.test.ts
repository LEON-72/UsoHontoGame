import { describe, it, expect } from 'vitest';
import { GameSessionV2, type Episode } from '@/server/domain-v2/entities/GameSessionV2';
import { GameState } from '@/types/session';

describe('GameSessionV2 Entity', () => {
  const validEpisodes: Episode[] = [
    { id: '1', content: 'First episode', order: 1, createdAt: new Date() },
    { id: '2', content: 'Second episode', order: 2, createdAt: new Date() },
  ];

  describe('Factory Method - create', () => {
    it('should create a GameSession with valid episodes', () => {
      const sessionId = 'TEST123';
      const hostId = 'host-1';

      const session = GameSessionV2.create(sessionId, hostId, validEpisodes);

      expect(session.id).toBe(sessionId);
      expect(session.hostId).toBe(hostId);
      expect(session.state).toBe(GameState.CREATED);
      expect(session.episodes).toEqual(validEpisodes);
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.startedAt).toBeUndefined();
      expect(session.endedAt).toBeUndefined();
    });

    it('should throw error when episode count is less than 1', () => {
      expect(() => {
        GameSessionV2.create('TEST123', 'host-1', []);
      }).toThrow('Episode count must be between 1 and 20');
    });

    it('should throw error when episode count is more than 20', () => {
      const tooManyEpisodes: Episode[] = Array.from({ length: 21 }, (_, i) => ({
        id: `${i}`,
        content: `Episode ${i}`,
        order: i + 1,
        createdAt: new Date(),
      }));

      expect(() => {
        GameSessionV2.create('TEST123', 'host-1', tooManyEpisodes);
      }).toThrow('Episode count must be between 1 and 20');
    });

    it('should accept exactly 1 episode', () => {
      const oneEpisode: Episode[] = [
        { id: '1', content: 'Single episode', order: 1, createdAt: new Date() },
      ];

      const session = GameSessionV2.create('TEST123', 'host-1', oneEpisode);
      expect(session.episodes).toHaveLength(1);
    });

    it('should accept exactly 20 episodes', () => {
      const twentyEpisodes: Episode[] = Array.from({ length: 20 }, (_, i) => ({
        id: `${i}`,
        content: `Episode ${i}`,
        order: i + 1,
        createdAt: new Date(),
      }));

      const session = GameSessionV2.create('TEST123', 'host-1', twentyEpisodes);
      expect(session.episodes).toHaveLength(20);
    });
  });

  describe('State Transitions', () => {
    it('should transition from CREATED to STARTED', () => {
      const session = GameSessionV2.create('TEST123', 'host-1', validEpisodes);

      session.start();

      expect(session.state).toBe(GameState.STARTED);
      expect(session.startedAt).toBeInstanceOf(Date);
    });

    it('should transition from STARTED to ENDED', () => {
      const session = GameSessionV2.create('TEST123', 'host-1', validEpisodes);
      session.start();

      session.end();

      expect(session.state).toBe(GameState.ENDED);
      expect(session.endedAt).toBeInstanceOf(Date);
    });

    it('should throw error when starting an already started game', () => {
      const session = GameSessionV2.create('TEST123', 'host-1', validEpisodes);
      session.start();

      expect(() => session.start()).toThrow('Game has already been started');
    });

    it('should throw error when ending a game that was not started', () => {
      const session = GameSessionV2.create('TEST123', 'host-1', validEpisodes);

      expect(() => session.end()).toThrow('Cannot end a game that has not been started');
    });

    it('should throw error when ending an already ended game', () => {
      const session = GameSessionV2.create('TEST123', 'host-1', validEpisodes);
      session.start();
      session.end();

      expect(() => session.end()).toThrow('Game has already been ended');
    });
  });

  describe('Immutability', () => {
    it('should not allow external modification of episodes array', () => {
      const session = GameSessionV2.create('TEST123', 'host-1', validEpisodes);
      const originalEpisodes = session.episodes;

      // Try to mutate the episodes array - should throw because it's frozen
      expect(() => {
        const mutableArray = session.episodes as Episode[] & { push: (item: Episode) => void };
        mutableArray.push({ id: '3', content: 'New', order: 3, createdAt: new Date() });
      }).toThrow();

      // Episodes should still be the same
      expect(session.episodes).toEqual(originalEpisodes);
    });
  });

  describe('State Queries', () => {
    it('should return true for isCreated when in CREATED state', () => {
      const session = GameSessionV2.create('TEST123', 'host-1', validEpisodes);

      expect(session.isCreated()).toBe(true);
      expect(session.isStarted()).toBe(false);
      expect(session.isEnded()).toBe(false);
    });

    it('should return true for isStarted when in STARTED state', () => {
      const session = GameSessionV2.create('TEST123', 'host-1', validEpisodes);
      session.start();

      expect(session.isCreated()).toBe(false);
      expect(session.isStarted()).toBe(true);
      expect(session.isEnded()).toBe(false);
    });

    it('should return true for isEnded when in ENDED state', () => {
      const session = GameSessionV2.create('TEST123', 'host-1', validEpisodes);
      session.start();
      session.end();

      expect(session.isCreated()).toBe(false);
      expect(session.isStarted()).toBe(false);
      expect(session.isEnded()).toBe(true);
    });
  });
});
