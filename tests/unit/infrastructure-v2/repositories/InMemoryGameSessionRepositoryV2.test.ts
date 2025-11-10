import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryGameSessionRepositoryV2 } from '@/server/infrastructure-v2/repositories/InMemoryGameSessionRepositoryV2';
import { GameSessionV2, type Episode } from '@/server/domain-v2/entities/GameSessionV2';

describe('InMemoryGameSessionRepositoryV2', () => {
  let repository: InMemoryGameSessionRepositoryV2;

  const validEpisodes: Episode[] = [
    { id: '1', content: 'First episode', order: 1, createdAt: new Date() },
    { id: '2', content: 'Second episode', order: 2, createdAt: new Date() },
  ];

  beforeEach(() => {
    repository = InMemoryGameSessionRepositoryV2.getInstance();
    repository.clearAll();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = InMemoryGameSessionRepositoryV2.getInstance();
      const instance2 = InMemoryGameSessionRepositoryV2.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('create', () => {
    it('should create and store a session', async () => {
      const session = GameSessionV2.create('TEST123', 'host-1', validEpisodes);

      await repository.create(session);

      const found = await repository.findById('TEST123');
      expect(found).toBeDefined();
      expect(found?.id).toBe('TEST123');
    });
  });

  describe('findById', () => {
    it('should return null when session does not exist', async () => {
      const found = await repository.findById('NONEXISTENT');

      expect(found).toBeNull();
    });

    it('should return the session when it exists', async () => {
      const session = GameSessionV2.create('TEST123', 'host-1', validEpisodes);
      await repository.create(session);

      const found = await repository.findById('TEST123');

      expect(found).toBeDefined();
      expect(found?.id).toBe('TEST123');
      expect(found?.hostId).toBe('host-1');
      expect(found?.episodes).toHaveLength(2);
    });
  });

  describe('exists', () => {
    it('should return false when session does not exist', async () => {
      const exists = await repository.exists('NONEXISTENT');

      expect(exists).toBe(false);
    });

    it('should return true when session exists', async () => {
      const session = GameSessionV2.create('TEST123', 'host-1', validEpisodes);
      await repository.create(session);

      const exists = await repository.exists('TEST123');

      expect(exists).toBe(true);
    });
  });

  describe('update', () => {
    it('should update an existing session', async () => {
      const session = GameSessionV2.create('TEST123', 'host-1', validEpisodes);
      await repository.create(session);

      // Start the session
      session.start();
      await repository.update(session);

      const found = await repository.findById('TEST123');
      expect(found?.isStarted()).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete a session', async () => {
      const session = GameSessionV2.create('TEST123', 'host-1', validEpisodes);
      await repository.create(session);

      await repository.delete('TEST123');

      const found = await repository.findById('TEST123');
      expect(found).toBeNull();
    });

    it('should not throw when deleting non-existent session', async () => {
      await expect(repository.delete('NONEXISTENT')).resolves.not.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no sessions exist', async () => {
      const all = await repository.findAll();

      expect(all).toEqual([]);
    });

    it('should return all sessions', async () => {
      const session1 = GameSessionV2.create('TEST123', 'host-1', validEpisodes);
      const session2 = GameSessionV2.create('TEST456', 'host-2', validEpisodes);

      await repository.create(session1);
      await repository.create(session2);

      const all = await repository.findAll();

      expect(all).toHaveLength(2);
      expect(all.map(s => s.id)).toContain('TEST123');
      expect(all.map(s => s.id)).toContain('TEST456');
    });
  });

  describe('clearAll', () => {
    it('should clear all sessions', async () => {
      const session1 = GameSessionV2.create('TEST123', 'host-1', validEpisodes);
      const session2 = GameSessionV2.create('TEST456', 'host-2', validEpisodes);

      await repository.create(session1);
      await repository.create(session2);

      repository.clearAll();

      const all = await repository.findAll();
      expect(all).toHaveLength(0);
    });
  });
});
