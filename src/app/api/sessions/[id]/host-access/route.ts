import { type NextRequest, NextResponse } from 'next/server';
import {
  NotFoundError,
  ValidationError,
} from '@/server/application/errors/ApplicationErrors';
import { CheckHostAccessUseCase } from '@/server/application/use-cases/sessions/CheckHostAccessUseCase';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';

/**
 * GET /api/sessions/[id]/host-access
 * Check if the current user is the host of the session
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    // Extract host ID from cookie
    const cookieName = `game_host_${sessionId}`;

    // Handle both real NextRequest and test mock requests
    let participantId = '';
    if (request.cookies && typeof request.cookies.get === 'function') {
      const hostCookie = request.cookies.get(cookieName);
      participantId = hostCookie?.value || '';
    } else {
      // Fallback for test environment - parse cookie header
      const cookieHeader = request.headers.get('Cookie') || '';
      const cookies = cookieHeader.split('; ');
      for (const cookie of cookies) {
        const [name, value] = cookie.split('=');
        if (name === cookieName) {
          participantId = value || '';
          break;
        }
      }
    }

    const sessionRepository = InMemoryGameSessionRepository.getInstance();
    const useCase = new CheckHostAccessUseCase(sessionRepository);

    const result = await useCase.execute({
      sessionId,
      participantId,
    });

    return NextResponse.json(createSuccessResponse(result), { status: 200 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        createErrorResponse(error.message, 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json(createErrorResponse(error.message, 'NOT_FOUND'), { status: 404 });
    }

    console.error('Error checking host access:', error);
    return NextResponse.json(createErrorResponse('Failed to check host access', 'INTERNAL_ERROR'), {
      status: 500,
    });
  }
}
