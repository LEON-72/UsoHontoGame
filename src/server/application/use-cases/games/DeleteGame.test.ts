// Unit Tests: DeleteGame Use Case
// Feature: 002-game-preparation

import { beforeEach, describe, expect, it } from 'vitest';
import { DeleteGame } from '@/server/application/use-cases/games/DeleteGame';
import { Game } from '@/server/domain/entities/Game';
import { NotFoundError } from '@/server/domain/errors/NotFoundError';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import { GameId } from '@/server/domain/value-objects/GameId';
import { GameStatus } from '@/server/domain/value-objects/GameStatus';
import { createMockGameRepository } from '../../../../../tests/utils/mockRepositories';

describe('DeleteGame', () => {
  let repository: IGameRepository;
  let useCase: DeleteGame;
  const creatorId = 'creator-session-123';
  const otherUserId = 'other-session-456';

  beforeEach(() => {
    repository = createMockGameRepository();
    useCase = new DeleteGame(repository);
  });

  it('should successfully delete a game', async () => {
    // Given: Game exists
    const gameId = '550e8400-e29b-41d4-a716-446655440001';
    const game = new Game(
      new GameId(gameId),
      'Test Game',
      new GameStatus('準備中'),
      10,
      0,
      new Date(),
      new Date(),
      creatorId
    );
    await repository.create(game);

    // When: Delete game
    const result = await useCase.execute({
      gameId,
      requesterId: creatorId,
    });

    // Then: Should succeed
    expect(result.success).toBe(true);

    // And: Game should be deleted
    const deletedGame = await repository.findById(new GameId(gameId));
    expect(deletedGame).toBeNull();
  });

  it('should throw NotFoundError if game does not exist', async () => {
    // Given: Non-existent game
    const gameId = '550e8400-e29b-41d4-a716-446655440999';

    // When/Then: Should throw NotFoundError
    await expect(
      useCase.execute({
        gameId,
        requesterId: creatorId,
      })
    ).rejects.toThrow(NotFoundError);
  });

  it('should throw error if requester is not the creator', async () => {
    // Given: Game created by different user
    const gameId = '550e8400-e29b-41d4-a716-446655440001';
    const game = new Game(
      new GameId(gameId),
      'Test Game',
      new GameStatus('準備中'),
      10,
      0,
      new Date(),
      new Date(),
      creatorId
    );
    await repository.create(game);

    // When/Then: Should throw authorization error
    await expect(
      useCase.execute({
        gameId,
        requesterId: otherUserId,
      })
    ).rejects.toThrow('Unauthorized');
  });

  it('should allow deletion of game in any status', async () => {
    // Given: Game in 出題中 status
    const gameId = '550e8400-e29b-41d4-a716-446655440001';
    const game = new Game(
      new GameId(gameId),
      'Active Game',
      new GameStatus('出題中'),
      10,
      5,
      new Date(),
      new Date(),
      creatorId
    );
    await repository.create(game);

    // When: Delete game
    const result = await useCase.execute({
      gameId,
      requesterId: creatorId,
    });

    // Then: Should succeed (deletion allowed for any status)
    expect(result.success).toBe(true);
    const deletedGame = await repository.findById(new GameId(gameId));
    expect(deletedGame).toBeNull();
  });

  it('should allow deletion of closed game', async () => {
    // Given: Game in 締切 status
    const gameId = '550e8400-e29b-41d4-a716-446655440001';
    const game = new Game(
      new GameId(gameId),
      'Closed Game',
      new GameStatus('締切'),
      10,
      8,
      new Date(),
      new Date(),
      creatorId
    );
    await repository.create(game);

    // When: Delete game
    const result = await useCase.execute({
      gameId,
      requesterId: creatorId,
    });

    // Then: Should succeed
    expect(result.success).toBe(true);
    const deletedGame = await repository.findById(new GameId(gameId));
    expect(deletedGame).toBeNull();
  });

  it('should return success = true on successful deletion', async () => {
    // Given: Game exists
    const gameId = '550e8400-e29b-41d4-a716-446655440001';
    const game = new Game(
      new GameId(gameId),
      'Test Game',
      new GameStatus('準備中'),
      10,
      0,
      new Date(),
      new Date(),
      creatorId
    );
    await repository.create(game);

    // When: Delete game
    const result = await useCase.execute({
      gameId,
      requesterId: creatorId,
    });

    // Then: Should return success true
    expect(result).toEqual({ success: true });
  });
});
