/**
 * Type Definitions for Connect Four Game
 * Centralized type definitions for type safety
 */

export type CellValue = 0 | 1 | 2; // 0 = empty, 1 = player 1, 2 = player 2
export type BoardState = CellValue[][];
export type Player = 1 | 2;

export interface Position {
  row: number;
  col: number;
}

export interface WinningLine {
  start: Position;
  end: Position;
  player: Player;
  direction: Direction;
}

export type Direction = 'horizontal' | 'vertical' | 'diagonal-up' | 'diagonal-down';

export interface GameConfig {
  rows: number;
  cols: number;
  connectN: number; // Number of dots to connect (typically 4)
}

export interface GameState {
  board: BoardState;
  currentPlayer: Player;
  winner: Player | null;
  winningLine: WinningLine | null;
  isGameOver: boolean;
  moveCount: number;
}

export type GameStatus = 'playing' | 'won' | 'draw';
