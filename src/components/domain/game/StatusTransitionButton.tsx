/**
 * StatusTransitionButton Component
 * Feature: 004-status-transition
 * Renders appropriate action buttons based on current game status
 */

'use client';

import { useState } from 'react';
import { closeGameAction, startGameAction } from '@/app/actions/game';
import type { GameStatusValue } from '@/server/domain/value-objects/GameStatus';

export interface StatusTransitionButtonProps {
  gameId: string;
  currentStatus: GameStatusValue;
  onSuccess?: (newStatus: GameStatusValue) => void;
  onError?: (error: string) => void;
  className?: string;
}

/**
 * Button component that renders the appropriate action based on game status
 * - 準備中: Show "ゲームを開始" button
 * - 出題中: Show "ゲームを締切" button with confirmation
 * - 締切: Show no button (no transitions allowed)
 */
export function StatusTransitionButton({
  gameId,
  currentStatus,
  onSuccess,
  onError,
  className = '',
}: StatusTransitionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStartGame = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('gameId', gameId);

      const result = await startGameAction(formData);

      if (result.success) {
        onSuccess?.('出題中');
      } else {
        const errorMessage = result.errors._form?.[0] || 'ゲームの開始に失敗しました';
        onError?.(errorMessage);
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'ゲームの開始に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseGame = async () => {
    if (isLoading) return;

    // Show confirmation dialog
    const confirmed = window.confirm('本当にゲームを締切しますか？');
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('gameId', gameId);
      formData.append('confirmed', 'true');

      const result = await closeGameAction(formData);

      if (result.success) {
        onSuccess?.('締切');
      } else {
        const errorMessage = result.errors._form?.[0] || 'ゲームの締切に失敗しました';
        onError?.(errorMessage);
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'ゲームの締切に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything for closed games
  if (currentStatus === '締切') {
    return null;
  }

  if (currentStatus === '準備中') {
    return (
      <button
        type="button"
        onClick={handleStartGame}
        disabled={isLoading}
        className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-label="ゲームを開始する"
        aria-disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg
              className="w-4 h-4 mr-2 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            開始中...
          </>
        ) : (
          'ゲームを開始'
        )}
      </button>
    );
  }

  if (currentStatus === '出題中') {
    return (
      <button
        type="button"
        onClick={handleCloseGame}
        disabled={isLoading}
        className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-label="ゲームを締切する"
        aria-disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg
              className="w-4 h-4 mr-2 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            締切中...
          </>
        ) : (
          'ゲームを締切'
        )}
      </button>
    );
  }

  // Should not reach here, but return null as fallback
  return null;
}

/**
 * Compact variant of the StatusTransitionButton for smaller spaces
 */
export function StatusTransitionButtonCompact({
  gameId,
  currentStatus,
  onSuccess,
  onError,
  className = '',
}: StatusTransitionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStartGame = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('gameId', gameId);

      const result = await startGameAction(formData);

      if (result.success) {
        onSuccess?.('出題中');
      } else {
        const errorMessage = result.errors._form?.[0] || 'ゲームの開始に失敗しました';
        onError?.(errorMessage);
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'ゲームの開始に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseGame = async () => {
    if (isLoading) return;

    const confirmed = window.confirm('本当にゲームを締切しますか？');
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('gameId', gameId);
      formData.append('confirmed', 'true');

      const result = await closeGameAction(formData);

      if (result.success) {
        onSuccess?.('締切');
      } else {
        const errorMessage = result.errors._form?.[0] || 'ゲームの締切に失敗しました';
        onError?.(errorMessage);
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'ゲームの締切に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStatus === '締切') {
    return null;
  }

  if (currentStatus === '準備中') {
    return (
      <button
        type="button"
        onClick={handleStartGame}
        disabled={isLoading}
        className={`inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-green-600 border border-transparent rounded hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-label="ゲームを開始する"
        aria-disabled={isLoading}
      >
        {isLoading ? '開始中...' : '開始'}
      </button>
    );
  }

  if (currentStatus === '出題中') {
    return (
      <button
        type="button"
        onClick={handleCloseGame}
        disabled={isLoading}
        className={`inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 border border-transparent rounded hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-label="ゲームを締切する"
        aria-disabled={isLoading}
      >
        {isLoading ? '締切中...' : '締切'}
      </button>
    );
  }

  return null;
}
