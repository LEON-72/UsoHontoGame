import { useEffect, useState } from 'react';
import type { ApiResponse } from '@/lib/api-response';
import { isSuccessResponse } from '@/lib/api-response';

interface HostAccessData {
  isHost: boolean;
  sessionId: string;
}

export interface UseHostAccessReturn {
  isHost: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * useHostAccess
 * Custom hook to check if the current user is the host of a session
 *
 * @param sessionId - The session ID to check host access for
 * @returns Object containing isHost status, loading state, and error
 */
export function useHostAccess(sessionId: string | undefined): UseHostAccessReturn {
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if sessionId is not provided
    if (!sessionId || sessionId.trim() === '') {
      setIsLoading(false);
      setIsHost(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const checkHostAccess = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/sessions/${sessionId}/host-access`);
        const data: ApiResponse<HostAccessData> = await response.json();

        if (cancelled) return;

        if (isSuccessResponse(data)) {
          setIsHost(data.data.isHost);
        } else {
          setIsHost(false);
          setError(data.error.message);
        }
      } catch (err) {
        if (cancelled) return;

        setIsHost(false);
        setError('Failed to check host access');
        console.error('Error checking host access:', err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    checkHostAccess();

    // Cleanup function to prevent state updates after unmount
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return {
    isHost,
    isLoading,
    error,
  };
}
