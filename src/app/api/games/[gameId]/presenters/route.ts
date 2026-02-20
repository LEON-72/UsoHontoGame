// API Route: Game Presenters List
// Feature: 003-presenter-episode-inline
// Returns list of presenters with episodes for a specific game (requires session)

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { PresenterApplicationService } from '@/server/application/services/PresenterApplicationService';

const presenterService = new PresenterApplicationService();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const result = await presenterService.getPresentersByGameId(gameId);

    if (!result.success) {
      const errorMessages = Object.values(result.errors).flat();
      return NextResponse.json(
        { error: 'Failed to get presenters', details: errorMessages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json({ presenters: result.data.presenters }, { status: 200 });
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
