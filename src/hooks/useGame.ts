//useGame.ts

import { useRef, useState } from "react"
import { Game } from "../models/Game"
import { Player } from "../types"


export function useGame() {
    // 1. Create Game instance
    const game = useRef(new Game())
    // 2. Store board state in React state
    const [boardState, setBoardState] = useState(game.current.getBoardState())
    const [currentPlayer, setCurrentPlayer] = useState(game.current.getCurrPlayer())
    const [status, setStatus] = useState(game.current.getGameStatus())
    const [winner, setWinner] = useState<Player | null>(game.current.getWinner())
    // 3. Provide methods to interact with game

    const syncState = () => {
        setCurrentPlayer(game.current.getCurrPlayer())
        setBoardState(game.current.getBoardState())
        setStatus(game.current.getGameStatus())
        setWinner(game.current.getWinner())
    }
    const handleMove = (col: number) => {
        const success = game.current.makeMove(col)
        if (success) {
            syncState()
            return true
        }
        return false
    }
    const resetGame = () => {
        game.current.reset()
        syncState()
    }

    const getNextAvailableRow = (col: number): number => {
        return game.current.getNextAvailableRow(col)
    }
    // 4. Return everything the UI needs

    return {
        boardState,      // Current board to render
        currentPlayer,   // Whose turn?
        winner,          // Who won?
        status,          // 'playing', 'won', 'draw'
        handleMove,      // Function to make a move
        resetGame,        // Function to reset
        getNextAvailableRow
    }
}