// Type definitions for GameListPage
// Feature: 002-game-preparation

import type { GameManagementDto } from '@/server/application/dto/GameDto';

/**
 * Props for GameListPage component
 */
export interface GameListPageProps {
  /** List of games to display */
  games: GameManagementDto[];
}

/**
 * Props for GameListPageError component
 */
export interface GameListPageErrorProps {
  /** Error message to display */
  errorMessage: string;
}
