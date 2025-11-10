import { beforeEach, describe, expect, it } from 'vitest';
import { CheckHostAccessUseCase } from '@/server/application/use-cases/sessions/CheckHostAccessUseCase';
import { GameSession } from '@/server/domain/entities/GameSession';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';
import type { SessionPhase } from '@/types/game';

describe('CheckHostAccessUseCase', () => {
  let sessionRepository: InMemoryGameSessionRepository;
  let useCase: CheckHostAccessUseCase;

  beforeEach(() => {
    sessionRepository = InMemoryGameSessionRepository.getInstance();
    // Clear repositories for test isolation
    sessionRepository.clearAll();
    useCase = new CheckHostAccessUseCase(sessionRepository);
  });

  it('should return true when participant is host of session', async () => {
    // Arrange
    const session = new GameSession(
      'TEST42',
      new Date(),
      new Date(),
      'preparation' as SessionPhase,
      'host-123',
      null,
      { pointsForCorrectGuess: 10, pointsPerDeception: 5 },
      [],
      0
    );
    await sessionRepository.save(session);

    const request = {
      sessionId: 'TEST42',
      participantId: 'host-123',
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.isHost).toBe(true);
    expect(result.sessionId).toBe('TEST42');
  });

  it('should return false when participant is not host of session', async () => {
    // Arrange
    const session = new GameSession(
      'TEST42',
      new Date(),
      new Date(),
      'preparation' as SessionPhase,
      'host-123',
      null,
      { pointsForCorrectGuess: 10, pointsPerDeception: 5 },
      [],
      0
    );
    await sessionRepository.save(session);

    const request = {
      sessionId: 'TEST42',
      participantId: 'other-participant',
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.isHost).toBe(false);
    expect(result.sessionId).toBe('TEST42');
  });

  it('should throw error if session does not exist', async () => {
    // Arrange
    const request = {
      sessionId: 'INVALID',
      participantId: 'host-123',
    };

    // Act & Assert
    await expect(useCase.execute(request)).rejects.toThrow();
  });

  it('should throw error if session ID is invalid format', async () => {
    // Arrange
    const request = {
      sessionId: 'invalid-id',
      participantId: 'host-123',
    };

    // Act & Assert
    await expect(useCase.execute(request)).rejects.toThrow();
  });

  it('should return false if participant ID is empty', async () => {
    // Arrange
    const session = new GameSession(
      'TEST42',
      new Date(),
      new Date(),
      'preparation' as SessionPhase,
      'host-123',
      null,
      { pointsForCorrectGuess: 10, pointsPerDeception: 5 },
      [],
      0
    );
    await sessionRepository.save(session);

    const request = {
      sessionId: 'TEST42',
      participantId: '',
    };

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.isHost).toBe(false);
    expect(result.sessionId).toBe('TEST42');
  });
});
