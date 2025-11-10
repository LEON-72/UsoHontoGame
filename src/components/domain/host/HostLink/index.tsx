'use client';

import Link from 'next/link';
import { useHostAccess } from '@/hooks/useHostAccess';

export interface HostLinkProps {
  sessionId: string | undefined;
}

/**
 * HostLink
 * Conditional link that only appears for session hosts
 * Links to the host management page for the session
 */
export function HostLink({ sessionId }: HostLinkProps) {
  const { isHost, isLoading } = useHostAccess(sessionId);

  // Don't render if not host, still loading, or no sessionId
  if (!isHost || isLoading || !sessionId) {
    return null;
  }

  return (
    <Link
      href={`/host/${sessionId}`}
      className="text-blue-600 hover:text-blue-800 underline text-sm font-medium transition-colors"
    >
      ホスト管理画面へ
    </Link>
  );
}
