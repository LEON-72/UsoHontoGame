/**
 * GameStatusBadge Component
 * Feature: 004-status-transition
 * Displays current game status with appropriate styling
 */

import type { GameStatusValue } from '@/server/domain/value-objects/GameStatus';

export interface GameStatusBadgeProps {
  status: GameStatusValue;
  className?: string;
}

/**
 * Badge component that displays game status with color-coded styling
 */
export function GameStatusBadge({ status, className = '' }: GameStatusBadgeProps) {
  const getStatusConfig = (status: GameStatusValue) => {
    switch (status) {
      case '準備中':
        return {
          label: '準備中',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          ariaLabel: 'ゲームは準備中です',
        };
      case '出題中':
        return {
          label: '出題中',
          className: 'bg-green-100 text-green-800 border-green-200',
          ariaLabel: 'ゲームは出題中です',
        };
      case '締切':
        return {
          label: '締切',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          ariaLabel: 'ゲームは締切です',
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          ariaLabel: `ゲームステータス: ${status}`,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className}`}
      aria-label={config.ariaLabel}
      role="status"
    >
      {config.label}
    </span>
  );
}

/**
 * Large variant of the GameStatusBadge for prominent display
 */
export function GameStatusBadgeLarge({ status, className = '' }: GameStatusBadgeProps) {
  const getStatusConfig = (status: GameStatusValue) => {
    switch (status) {
      case '準備中':
        return {
          label: '準備中',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          ariaLabel: 'ゲームは準備中です',
        };
      case '出題中':
        return {
          label: '出題中',
          className: 'bg-green-100 text-green-800 border-green-300',
          ariaLabel: 'ゲームは出題中です',
        };
      case '締切':
        return {
          label: '締切',
          className: 'bg-gray-100 text-gray-800 border-gray-300',
          ariaLabel: 'ゲームは締切です',
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-300',
          ariaLabel: `ゲームステータス: ${status}`,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold border-2 ${config.className} ${className}`}
      aria-label={config.ariaLabel}
      role="status"
    >
      {config.label}
    </span>
  );
}
