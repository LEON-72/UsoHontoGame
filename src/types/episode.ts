/**
 * Episode type definitions
 * These types represent individual statements/episodes in the game
 */

/**
 * Episode - Represents a single statement made by a player
 * In "Two Truths and a Lie", each player provides 3 episodes
 */
export interface Episode {
  id: string;
  content: string;
  order: number;
  createdAt: Date;
}

/**
 * Episode with truth value - Used internally and during reveal phase
 */
export interface EpisodeWithTruth extends Episode {
  isLie: boolean;
}
