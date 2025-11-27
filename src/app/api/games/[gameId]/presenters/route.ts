// API Route: Game Presenters List
// Feature: 003-presenter-episode-inline
// Returns list of presenters with episodes for a specific game (requires session)

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { GetPresentersByGameId } from '@/server/application/use-cases/games/GetPresentersByGameId';
import { SessionServiceContainer } from '@/server/infrastructure/di/SessionServiceContainer';
import { createGameRepository } from '@/server/infrastructure/repositories';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
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

    // Extract gameId from params
    const { gameId } = await params;

    // Execute GetPresentersByGameId use case
    const repository = createGameRepository();
    const useCase = new GetPresentersByGameId(repository);

    const result = await useCase.execute({
      gameId,
      requesterId: sessionId,
    });

    // Return successful response
    return NextResponse.json({ presenters: result.presenters }, { status: 200 });
  } catch (error) {
    console.error('Presenters API error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
