// App Router Page: Answer Submission
// Feature: 001-lie-detection-answers
// Client Component wrapper for AnswerSubmissionPage

import { AnswerSubmissionPage } from '@/components/pages/AnswerSubmissionPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Next.js App Router page for /games/[id]/answer
 * Thin wrapper that extracts route params and delegates to AnswerSubmissionPage
 *
 * Validation is handled by useGameValidation hook within AnswerSubmissionPage:
 * - Session check (FR-012)
 * - Game status validation (FR-010)
 * - Presenter count check (FR-015)
 * - Participant limit validation (FR-008, FR-009)
 */
export default async function Page({ params }: PageProps) {
  // Extract game ID from route params
  const { id: gameId } = await params;

  // Delegate to AnswerSubmissionPage component
  // All validation and business logic handled by useGameValidation hook
  return <AnswerSubmissionPage gameId={gameId} />;
}
