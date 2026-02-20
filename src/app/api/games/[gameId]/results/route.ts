// API Route: GET /api/games/[gameId]/results
// Feature: 006-results-dashboard, User Story 3
// Returns final rankings with winner highlighting

import { type NextRequest, NextResponse } from 'next/server';
import { ResultsApplicationService } from '@/server/application/services/ResultsApplicationService';

const resultsService = new ResultsApplicationService();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const result = await resultsService.getResults(gameId);

    if (!result.success) {
      const errorMessages = Object.values(result.errors).flat();
      return NextResponse.json(
        { error: 'Failed to get results', details: errorMessages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/games/[gameId]/results:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
