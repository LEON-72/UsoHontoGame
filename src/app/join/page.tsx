'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { JoinPage } from '@/components/pages/JoinPage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * Join Page Content with Search Params
 */
function JoinPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId') || undefined;

  return <JoinPage sessionId={sessionId} />;
}

/**
 * Loading fallback component for Suspense
 */
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Join Page Route
 * Allows users to join a session or create a new one
 * Supports sessionId query parameter for direct joining after game creation
 */
export default function JoinGamePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <JoinPageContent />
    </Suspense>
  );
}
