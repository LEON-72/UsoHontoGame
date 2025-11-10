'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import type { ApiResponse } from '@/lib/api-response';

interface Episode {
  content: string;
}

interface CreateGameResponse {
  sessionId: string;
  message: string;
}

/**
 * Custom hook for game creation functionality
 * Handles episode management, validation, and API calls
 */
export function useGameCreation() {
  const router = useRouter();
  const toast = useToast();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Add a new empty episode
   */
  const addEpisode = () => {
    if (episodes.length >= 20) {
      return; // Silently prevent adding more than 20
    }
    setEpisodes([...episodes, { content: '' }]);
  };

  /**
   * Update episode content at specific index
   */
  const updateEpisode = (index: number, content: string) => {
    const newEpisodes = [...episodes];
    newEpisodes[index] = { content };
    setEpisodes(newEpisodes);
  };

  /**
   * Remove episode at specific index
   */
  const removeEpisode = (index: number) => {
    const newEpisodes = episodes.filter((_, i) => i !== index);
    setEpisodes(newEpisodes);
  };

  /**
   * Validate episodes before submission
   */
  const validateEpisodes = (): boolean => {
    if (episodes.length === 0) {
      toast.error('Please add at least one episode');
      return false;
    }

    const hasEmptyContent = episodes.some((ep) => ep.content.trim().length === 0);
    if (hasEmptyContent) {
      toast.error('All episodes must have content');
      return false;
    }

    return true;
  };

  /**
   * Create game by calling API with comprehensive error handling
   */
  const createGame = async () => {
    setError(null);

    // Validate
    if (!validateEpisodes()) {
      return;
    }

    setIsLoading(true);

    try {
      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/sessions-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          episodes: episodes.map((ep) => ({ content: ep.content })),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-OK responses
      if (!response.ok) {
        // Try to parse error response
        let errorMessage = 'Failed to create game';
        try {
          const data: ApiResponse<CreateGameResponse> = await response.json();
          if (data.success === false) {
            errorMessage = data.error.message;
          }
        } catch {
          // If JSON parsing fails, use status-based message
          if (response.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (response.status === 400) {
            errorMessage = 'Invalid request. Please check your episodes.';
          } else if (response.status === 429) {
            errorMessage = 'Too many requests. Please wait a moment and try again.';
          }
        }
        toast.error(errorMessage);
        setError(errorMessage);
        return;
      }

      const data: ApiResponse<CreateGameResponse> = await response.json();

      if (!data.success) {
        const errorMessage = data.error.message || 'Failed to create game';
        toast.error(errorMessage);
        setError(errorMessage);
        return;
      }

      // Success - show toast with session ID
      toast.success(data.data.message);

      // Redirect to join page with session ID
      router.push(`/join?sessionId=${data.data.sessionId}`);
    } catch (err) {
      console.error('Error creating game:', err);

      // Determine error type and show appropriate message
      let errorMessage = 'Failed to create game. Please try again.';

      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Request timed out. Please check your connection and try again.';
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
      }

      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    episodes,
    isLoading,
    error,
    addEpisode,
    updateEpisode,
    removeEpisode,
    createGame,
  };
}
