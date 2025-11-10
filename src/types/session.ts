/**
 * Session type definitions for game state management
 * These types represent the client-side view of game sessions
 */

import type { Episode } from './episode';

/**
 * Unique identifier for a game session
 */
export type SessionID = string;

/**
 * Game state enum - Represents the lifecycle state of a game session
 */
export enum GameState {
  CREATED = 'created',
  STARTED = 'started',
  ENDED = 'ended',
}

/**
 * Player information within a game session
 */
export interface Player {
  id: string;
  nickname: string;
  teamId: string | null;
  episodes: Episode[];
  isHost: boolean;
}

/**
 * Game session - Represents a complete game instance
 */
export interface GameSession {
  id: SessionID;
  hostId: string;
  state: GameState;
  episodes: Episode[];
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  players: Player[];
  maxPlayers: number;
}
