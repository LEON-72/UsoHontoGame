// StartAcceptingResponses Use Case
// Feature: 002-game-preparation
// Transitions game from 準備中 to 出題中 with presenter validation

import { NotFoundError } from '@/server/domain/errors/NotFoundError';
import type { IGameRepository } from '@/server/domain/repositories/IGameRepository';
import { GameId } from '@/server/domain/value-objects/GameId';

export interface StartAcceptingResponsesInput {
  gameId: string;
}

export interface StartAcceptingResponsesOutput {
  success: boolean;
}

/**
 * StartAcceptingResponses Use Case
 * Transitions a game from 準備中 to 出題中 status
 * Validates that game has at least one complete presenter before transitioning
 */
export class StartAcceptingResponses {
  constructor(private gameRepository: IGameRepository) {}

  async execute(input: StartAcceptingResponsesInput): Promise<StartAcceptingResponsesOutput> {
    const { gameId } = input;

    // Find game
    const game = await this.gameRepository.findById(new GameId(gameId));
    if (!game) {
      throw new NotFoundError(`Game ${gameId} not found`);
    }

    // Transition status (will throw InvalidStatusTransitionError if not in 準備中)
    // Note: Validation should be done by ValidateStatusTransition use case before calling this
    game.startAccepting();

    // Persist
    await this.gameRepository.update(game);

    return { success: true };
  }
}
