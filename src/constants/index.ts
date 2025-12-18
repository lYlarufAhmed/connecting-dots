/**
 * Game Constants
 * Centralized configuration values
 */

import { GameConfig } from '../types';

export const DEFAULT_GAME_CONFIG: GameConfig = {
  rows: 6,
  cols: 7,
  connectN: 4,
};

export const PLAYER_COLORS = {
  1: '#ff6b6b', // Red
  2: '#4ecdc4', // Teal
  empty: '#f0f0f0', // Light gray
} as const;

export const EMPTY_CELL = 0 as const;
export const PLAYER_ONE = 1 as const;
export const PLAYER_TWO = 2 as const;

// Animation durations (in milliseconds)
export const ANIMATION = {
  DROP_DURATION: 300,
  WIN_HIGHLIGHT_DURATION: 500,
} as const;

// Direction vectors for win detection
// [rowDelta, colDelta]
export const DIRECTION_VECTORS = {
  horizontal: [0, 1],
  vertical: [1, 0],
  diagonalDown: [1, 1],   // top-left to bottom-right
  diagonalUp: [1, -1],    // bottom-left to top-right
} as const;
