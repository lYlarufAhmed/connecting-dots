/**
 * 
 * Board Model
 * Manages the game board state and basic operations
 * Follows Single reponsibilities Principle - only handles board data
 */


import { DEFAULT_GAME_CONFIG, EMPTY_CELL } from "../constants";
import { BoardState, CellValue, Player, Position } from "../types";


export class Board {
    private state: BoardState;
    private readonly rows: number;
    private readonly cols: number;


    constructor(rows: number = DEFAULT_GAME_CONFIG.rows, cols: number = DEFAULT_GAME_CONFIG.cols) {
        this.rows = rows
        this.cols = cols
        this.state = this.createEmptyBoard()
    }

    private createEmptyBoard(): BoardState {
        return Array(this.rows)
            .fill(null)
            .map(() => Array(this.cols).fill(EMPTY_CELL))
    }

    getState(): BoardState {
        return this.state.map(row => [...row])
    }


    getCell(row: number, col: number): CellValue {

        if (!this.isValidPosition(row, col)) throw new Error(`Invalid position: ${row}, ${col}`)
        return this.state[row][col]
    }

    setCell(row: number, col: number, value: CellValue): void {

        if (!this.isValidPosition(row, col)) throw new Error(`Invalid position: ${row}, ${col}`)
        this.state[row][col] = value
    }

    isValidPosition(row: number, col: number): boolean {
        if (row >= this.rows || col >= this.cols || row < 0 || col < 0) return false
        return true
    }


    isColumnFull(col: number): boolean {
        return !this.state.some(row => row[col] === EMPTY_CELL)
    }


    getNextAvailableRow(col: number): number {
        return this.state.findLastIndex((row) => row[col] === EMPTY_CELL)
    }

    dropPiece(col: number, player: Player): number {
        const availableRow = this.getNextAvailableRow(col)
        if (availableRow !== -1) {
            this.setCell(availableRow, col, player)
        }
        return availableRow

    }



    isFull(): boolean {
        return !this.state[0].some(cell => cell === EMPTY_CELL)
    }


    reset(): void {
        this.state = this.createEmptyBoard()
    }

    getRows(): number {
        return this.rows
    }

    getCols(): number {
        return this.cols
    }


    clone(): Board {
        const newBoard = new Board(this.rows, this.cols)
        newBoard.state = this.getState()
        return newBoard
    }

    loadState(state: BoardState): void {
        if (state.length !== this.rows || state[0].length !== this.cols)
            throw new Error(`Invalid board state dimensions`)
        this.state = state.map(row => [...row])
    }





}