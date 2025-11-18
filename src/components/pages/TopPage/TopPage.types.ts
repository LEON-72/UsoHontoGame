// Type definitions for TopPage
// Feature: 001-session-top-page

import type { GameDto } from '@/server/application/dto/GameDto';

/**
 * Props for TopPageNicknameSetup component
 * Displayed when user doesn't have a nickname set
 */
export type TopPageNicknameSetupProps = Record<string, never>;

/**
 * Props for TopPage component
 * Displayed when user has nickname set
 */
export interface TopPageProps {
  /** User's nickname */
  nickname: string;
  /** List of available games */
  games: GameDto[];
}
