// Unit Tests: StartAcceptingResponses Use Case
// Feature: 002-game-preparation
// Tests for transitioning games to accepting responses status
// Note: Validation should be done by ValidateStatusTransition use case before calling this

import { beforeEach, describe, expect, it } from 'vitest';
import { StartAcceptingResponses } from '@/server/application/use-cases/games/StartAcceptingResponses';
import { Game } from '@/server/domain/entities/Game';
import { InvalidStatusTransitionError } from '@/server/domain/errors/InvalidStatusTransitionError';
import { NotFoundError } from '@/server/domain/errors/NotFoundError';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import { GameId } from '@/server/domain/value-objects/GameId';
import { GameStatus } from '@/server/domain/value-objects/GameStatus';
import { createMockGameRepository } from '../../../../../tests/utils/mockRepositories';

describe('StartAcceptingResponses Use Case', () => {
  let repository: IGameRepository;
  let useCase: StartAcceptingResponses;

  beforeEach(() => {
    repository = createMockGameRepository();
    useCase = new StartAcceptingResponses(repository);
  });

  describe('Success Cases', () => {
    it('should transition game from 準備中 to 出題中', async () => {
      // Given: Game in 準備中 status
      const gameId = '550e8400-e29b-41d4-a716-446655440001';
      const game = new Game(
        new GameId(gameId),
        'Test Game',
        new GameStatus('準備中'),
        10,
        0,
        new Date(),
        new Date()
      );
      await repository.create(game);

      // When
      const result = await useCase.execute({ gameId });

      // Then
      expect(result.success).toBe(true);

      const updatedGame = await repository.findById(new GameId(gameId));
      expect(updatedGame?.status.toString()).toBe('出題中');
    });
  });

  describe('Error Cases', () => {
    it('should reject transition when game does not exist', async () => {
      // Given: Non-existent but valid UUID
      const gameId = '550e8400-e29b-41d4-a716-446655440999';

      // When/Then
      await expect(useCase.execute({ gameId })).rejects.toThrow(NotFoundError);
      await expect(useCase.execute({ gameId })).rejects.toThrow('not found');
    });

    it('should reject transition when game is already in 出題中 status', async () => {
      // Given: Game already in 出題中
      const gameId = '550e8400-e29b-41d4-a716-446655440007';
      const game = new Game(
        new GameId(gameId),
        'Test Game',
        new GameStatus('出題中'), // Already accepting
        10,
        0,
        new Date(),
        new Date()
      );
      await repository.create(game);

      // When/Then
      await expect(useCase.execute({ gameId })).rejects.toThrow(InvalidStatusTransitionError);
    });

    it('should reject transition when game is in 締切 status', async () => {
      // Given: Game in 締切 status
      const gameId = '550e8400-e29b-41d4-a716-446655440008';
      const game = new Game(
        new GameId(gameId),
        'Test Game',
        new GameStatus('締切'), // Closed
        10,
        0,
        new Date(),
        new Date()
      );
      await repository.create(game);

      // When/Then
      await expect(useCase.execute({ gameId })).rejects.toThrow(InvalidStatusTransitionError);
    });
  });
});
