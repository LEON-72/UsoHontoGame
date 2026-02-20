// API Route: Response Status Dashboard
// Feature: 006-results-dashboard, User Story 1
// Feature: 007-game-closure, User Story 3 (added closed game support)
// Returns real-time response submission status (requires session)

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { DashboardApplicationService } from '@/server/application/services/DashboardApplicationService';

const dashboardService = new DashboardApplicationService();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const result = await dashboardService.getResponseStatus(gameId);

    if (!result.success) {
      const errorMessage = result.errors._form?.[0] || 'Unknown error';
      if (errorMessage.toLowerCase().includes('not found')) {
        return NextResponse.json(
          { error: 'Game not found', details: `No game with ID ${gameId}` },
          { status: 404 }
        );
      }
      if (errorMessage.includes('not accepting responses')) {
        return NextResponse.json(
          {
            error: 'Game not accepting responses',
            details: "Dashboard only available when game status is '出題中' or '締切'",
          },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: 'Bad Request', details: errorMessage }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
