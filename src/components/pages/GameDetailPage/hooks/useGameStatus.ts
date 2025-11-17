/**
 * useGameStatus Hook
 * Feature: 004-status-transition
 * Manages game status transitions with optimistic updates
 */

'use client';

import { useCallback, useState } from 'react';
import { closeGameAction, startGameAction } from '@/app/actions/game';
import type { GameStatusValue } from '@/server/domain/value-objects/GameStatus';

export interface UseGameStatusOptions {
  gameId: string;
  initialStatus: GameStatusValue;
  onSuccess?: (newStatus: GameStatusValue) => void;
  onError?: (error: string) => void;
}

export interface UseGameStatusReturn {
  currentStatus: GameStatusValue;
  isLoading: boolean;
  canStart: boolean;
  canClose: boolean;
  startGame: () => Promise<void>;
  closeGame: () => Promise<void>;
  resetStatus: () => void;
}

/**
 * Hook for managing game status transitions with optimistic updates
 */
export function useGameStatus({
  gameId,
  initialStatus,
  onSuccess,
  onError,
}: UseGameStatusOptions): UseGameStatusReturn {
  const [currentStatus, setCurrentStatus] = useState<GameStatusValue>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate what transitions are available
  const canStart = currentStatus === '準備中';
  const canClose = currentStatus === '出題中';

  const startGame = useCallback(async () => {
    if (isLoading || !canStart) return;

    setIsLoading(true);

    // Optimistic update
    const previousStatus = currentStatus;
    setCurrentStatus('出題中');

    try {
      const formData = new FormData();
      formData.append('gameId', gameId);

      const result = await startGameAction(formData);

      if (result.success) {
        onSuccess?.('出題中');
      } else {
        // Rollback optimistic update
        setCurrentStatus(previousStatus);
        const errorMessage = result.errors._form?.[0] || 'ゲームの開始に失敗しました';
        onError?.(errorMessage);
      }
    } catch (error) {
      // Rollback optimistic update
      setCurrentStatus(previousStatus);
      onError?.(error instanceof Error ? error.message : 'ゲームの開始に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [gameId, currentStatus, canStart, isLoading, onSuccess, onError]);

  const closeGame = useCallback(async () => {
    if (isLoading || !canClose) return;

    setIsLoading(true);

    // Optimistic update
    const previousStatus = currentStatus;
    setCurrentStatus('締切');

    try {
      const formData = new FormData();
      formData.append('gameId', gameId);

      const result = await closeGameAction(formData);

      if (result.success) {
        onSuccess?.('締切');
      } else {
        // Rollback optimistic update
        setCurrentStatus(previousStatus);
        const errorMessage = result.errors._form?.[0] || 'ゲームの締切に失敗しました';
        onError?.(errorMessage);
      }
    } catch (error) {
      // Rollback optimistic update
      setCurrentStatus(previousStatus);
      onError?.(error instanceof Error ? error.message : 'ゲームの締切に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [gameId, currentStatus, canClose, isLoading, onSuccess, onError]);

  const resetStatus = useCallback(() => {
    setCurrentStatus(initialStatus);
    setIsLoading(false);
  }, [initialStatus]);

  return {
    currentStatus,
    isLoading,
    canStart,
    canClose,
    startGame,
    closeGame,
    resetStatus,
  };
}
