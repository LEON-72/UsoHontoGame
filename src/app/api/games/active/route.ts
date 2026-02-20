// API Route: Active Games List
// Feature: 005-top-active-games (User Story 4)
// Returns list of games with status '出題中' / '締切' (publicly accessible, no auth required)

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { GameApplicationService } from '@/server/application/services/GameApplicationService';

const gameService = new GameApplicationService();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get('cursor') || undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    if (limitParam && (Number.isNaN(limit!) || limit! < 1 || limit! > 100)) {
      return NextResponse.json(
        { error: 'Bad Request', details: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    const result = await gameService.getActiveGames({ cursor, limit });

    return NextResponse.json(
      {
        games: result.games,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor,
        total: result.total,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Active games API error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
