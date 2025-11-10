import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GET } from '@/app/api/sessions/[id]/host-access/route';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';
import { GameSession } from '@/server/domain/entities/GameSession';
import { createMockRequest, parseResponse } from './test-helpers';
import type { SessionPhase } from '@/types/game';

describe('GET /api/sessions/[id]/host-access', () => {
  let sessionRepository: InMemoryGameSessionRepository;

  beforeEach(() => {
    sessionRepository = InMemoryGameSessionRepository.getInstance();
    sessionRepository.clearAll();
  });

  afterEach(() => {
    sessionRepository.clearAll();
  });

  it('should return isHost true when participant is the host', async () => {
    // Arrange: Create a session
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

    // Create request with host cookie
    const request = createMockRequest('GET', 'http://localhost:3000/api/sessions/TEST42/host-access', {
      headers: {
        Cookie: 'game_host_TEST42=host-123',
      },
    });

    // Act
    const response = await GET(request, { params: Promise.resolve({ id: 'TEST42' }) });
    const data = await parseResponse(response);

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.isHost).toBe(true);
    expect(data.data.sessionId).toBe('TEST42');
  });

  it('should return isHost false when participant is not the host', async () => {
    // Arrange: Create a session
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

    // Create request with non-host cookie
    const request = createMockRequest('GET', 'http://localhost:3000/api/sessions/TEST42/host-access', {
      headers: {
        Cookie: 'game_host_TEST42=player-456',
      },
    });

    // Act
    const response = await GET(request, { params: Promise.resolve({ id: 'TEST42' }) });
    const data = await parseResponse(response);

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.isHost).toBe(false);
    expect(data.data.sessionId).toBe('TEST42');
  });

  it('should return isHost false when no host cookie is present', async () => {
    // Arrange: Create a session
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

    // Create request without cookie
    const request = createMockRequest('GET', 'http://localhost:3000/api/sessions/TEST42/host-access');

    // Act
    const response = await GET(request, { params: Promise.resolve({ id: 'TEST42' }) });
    const data = await parseResponse(response);

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.isHost).toBe(false);
    expect(data.data.sessionId).toBe('TEST42');
  });

  it('should return 404 when session does not exist', async () => {
    // Create request for non-existent but valid formatted session ID
    // Note: Valid session IDs use characters from [23456789ABCDEFGHJKMNPQRSTUVWXYZ] (no 0,1,I,L,O)
    const request = createMockRequest(
      'GET',
      'http://localhost:3000/api/sessions/ABCD23/host-access',
      {
        headers: {
          Cookie: 'game_host_ABCD23=host-123',
        },
      }
    );

    // Act
    const response = await GET(request, { params: Promise.resolve({ id: 'ABCD23' }) });
    const data = await parseResponse(response);

    // Assert
    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 for invalid session ID format', async () => {
    // Create request with invalid session ID format (lowercase, hyphens, etc)
    const request = createMockRequest(
      'GET',
      'http://localhost:3000/api/sessions/invalid/host-access',
      {
        headers: {
          Cookie: 'game_host_invalid=host-123',
        },
      }
    );

    // Act
    const response = await GET(request, { params: Promise.resolve({ id: 'invalid' }) });
    const data = await parseResponse(response);

    // Assert
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});
