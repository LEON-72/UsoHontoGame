// API Route: Presenter Episodes
// Feature: 003-presenter-episode-inline
// Returns presenter with episodes (requires session)

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { GetPresenterEpisodes } from '@/server/application/use-cases/games/GetPresenterEpisodes';
import { SessionServiceContainer } from '@/server/infrastructure/di/SessionServiceContainer';
import { createGameRepository } from '@/server/infrastructure/repositories';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ presenterId: string }> }
) {
  try {
    // Validate session (required for presenter management)
    let sessionId: string;
    try {
      const sessionService = SessionServiceContainer.getSessionService();
      sessionId = await sessionService.requireCurrentSession();
    } catch {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Session required' },
        { status: 401 }
      );
    }

    // Extract presenterId from params
    const { presenterId } = await params;

    // Execute GetPresenterEpisodes use case
    const repository = createGameRepository();
    const useCase = new GetPresenterEpisodes(repository);

    const result = await useCase.execute({
      presenterId,
      requesterId: sessionId,
    });

    // Return successful response
    return NextResponse.json({ presenter: result.presenter }, { status: 200 });
  } catch (error) {
    console.error('Presenter episodes API error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
