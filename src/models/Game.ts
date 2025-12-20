/**
 * Track whose Turn
 * Detect winner
 * Handle Game State
 */

import { DEFAULT_GAME_CONFIG } from "../constants";
import { BoardState, GameConfig, GameState, GameStatus, Player } from "../types";
import { Board } from "./Board";


export class Game {
    private board: Board
    private currPlayer: Player
    private winner: Player | null;
    private readonly config: GameConfig
    private status: GameStatus

    constructor(config: GameConfig = DEFAULT_GAME_CONFIG) {

        this.config = config
        this.board = new Board(config.rows, config.cols)
        this.currPlayer = 1
        this.winner = null
        this.status = 'playing'

    }

    getWinner(): Player | null {
        return this.winner
    }

    getCurrPlayer(): Player {
        return this.currPlayer
    }


    getBoardState(): BoardState {
        return this.board.getState()
    }

    getGameStatus(): GameStatus {
        return this.status
    }


    isGameOver(): boolean {
        return this.winner !== null || this.board.isFull()
    }



    makeMove(col: number): boolean {


        if (this.isGameOver()) return false

        const row = this.board.dropPiece(col, this.currPlayer)
        if (row == -1) return false

        this.winner = this.checkWinner()

        if (this.winner) {
            console.log('winner ', this.winner)
            this.status = 'won'
        } else if (this.board.isFull()) {
            console.log('Board Full')
            this.status = 'draw'
        } else {

            this.currPlayer = this.currPlayer == 1 ? 2 : 1
        }
        return true





    }


    reset(): void {
        this.winner = null
        this.board.reset()
        this.currPlayer = 1
        this.status = 'playing'
    }


    private checkWinner(): Player | null {
        const directions = [
            [0, 1],
            [1, 0],
            [1, 1],
            [1, -1],
        ];
        const N = this.config.connectN
        const board = this.board.getState()
        for (let r = 0; r < board.length; r++) {
            for (let c = 0; c < board[0].length; c++) {
                let cell = board[r][c];
                if (cell !== 0) {
                    for (let [dr, dc] of directions) {
                        let count = 1;
                        let i = 1;
                        while (i < N) {
                            let nR = r + i * dr;
                            let nC = c + i * dc;
                            if (nR < 0 || nR >= board.length || nC < 0 || nC >= board[0].length)
                                break;
                            if (board[nR][nC] == cell) count += 1;
                            else break;

                            if (count == N) {
                                return cell;
                            }
                            i += 1;
                        }
                    }
                }
            }
        }
        return null

    }

    getNextAvailableRow(col: number): number {
        return this.board.getNextAvailableRow(col)
    }

}