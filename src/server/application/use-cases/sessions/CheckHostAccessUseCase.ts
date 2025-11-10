import {
  NotFoundError,
  ValidationError,
} from '@/server/application/errors/ApplicationErrors';
import { validateSessionId } from '@/lib/validators';
import type { IGameSessionRepository } from '@/server/domain/repositories/IGameSessionRepository';

export interface CheckHostAccessRequest {
  sessionId: string;
  participantId: string;
}

export interface CheckHostAccessResponse {
  isHost: boolean;
  sessionId: string;
}

/**
 * Use Case: Check if participant has host access
 * Validates if the given participant is the host of the session
 */
export class CheckHostAccessUseCase {
  constructor(private sessionRepository: IGameSessionRepository) {}

  async execute(request: CheckHostAccessRequest): Promise<CheckHostAccessResponse> {
    // Validate session ID format
    if (!validateSessionId(request.sessionId)) {
      throw new ValidationError('Invalid session ID format');
    }

    // Check session exists
    const session = await this.sessionRepository.findById(request.sessionId);
    if (!session) {
      throw new NotFoundError('Session', request.sessionId);
    }

    // If no participant ID provided, user is not host
    if (!request.participantId || request.participantId.trim() === '') {
      return {
        isHost: false,
        sessionId: request.sessionId,
      };
    }

    // Check if participant is host
    const isHost = session.hostId === request.participantId;

    return {
      isHost,
      sessionId: request.sessionId,
    };
  }
}
