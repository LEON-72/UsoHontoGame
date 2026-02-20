// API Route: Presenter Episodes
// Feature: 003-presenter-episode-inline
// Returns presenter with episodes (requires session)

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { PresenterApplicationService } from '@/server/application/services/PresenterApplicationService';

const presenterService = new PresenterApplicationService();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ presenterId: string }> }
) {
  try {
    const { presenterId } = await params;
    const result = await presenterService.getPresenterEpisodes(presenterId);

    if (!result.success) {
      const errorMessages = Object.values(result.errors).flat();
      const status = errorMessages.some((m) => m.toLowerCase().includes('not found')) ? 404 : 400;
      return NextResponse.json(
        { error: 'Failed to get presenter episodes', details: errorMessages.join(', ') },
        { status }
      );
    }

    return NextResponse.json({ presenter: result.data.presenter }, { status: 200 });
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
