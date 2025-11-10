import { type NextRequest, NextResponse } from 'next/server';
import { CreateGameSessionUseCaseV2 } from '@/server/application-v2/use-cases/sessions/CreateGameSessionUseCaseV2';
import { InMemoryGameSessionRepositoryV2 } from '@/server/infrastructure-v2/repositories/InMemoryGameSessionRepositoryV2';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';

/**
 * POST /api/sessions-v2
 * Creates a new game session with episodes (new flow)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.episodes || !Array.isArray(body.episodes)) {
      return NextResponse.json(
        createErrorResponse('Episodes must be an array', 'INVALID_REQUEST'),
        { status: 400 }
      );
    }

    // Create use case and execute
    const repository = InMemoryGameSessionRepositoryV2.getInstance();
    const useCase = new CreateGameSessionUseCaseV2(repository);

    const result = await useCase.execute({
      episodes: body.episodes,
    });

    return NextResponse.json(createSuccessResponse(result), { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      // Check if it's a validation error
      if (
        error.message.includes('Episode count must be between') ||
        error.message.includes('Episode content cannot be empty')
      ) {
        return NextResponse.json(createErrorResponse(error.message, 'VALIDATION_ERROR'), {
          status: 400,
        });
      }
    }

    console.error('Error creating game session:', error);
    return NextResponse.json(
      createErrorResponse('Failed to create game session', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}
