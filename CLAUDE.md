# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Connect Four game (locally called "Connecting Dots") built with React Native and Expo. The game allows two players to connect N dots (typically 4) on a 7x6 grid.

## Development Commands

```bash
# Start the development server
npm start

# Run on specific platforms
npm run android
npm run ios
npm run web
```

## Architecture

The project follows a **Model-View pattern** with strict separation of concerns:

### Core Architecture Layers

```
src/
├── types/          - TypeScript type definitions for the entire application
├── constants/      - Game configuration and immutable values
├── models/         - Pure game logic (no UI dependencies)
├── components/     - React components (View layer) [TODO: Not yet implemented]
├── controllers/    - Orchestration layer [TODO: Not yet implemented]
└── utils/          - Helper functions [TODO: Not yet implemented]
```

### Model Layer (src/models/)

The game logic is implemented using two core classes:

**`Board.ts`** - Manages the game board state
- Encapsulates a 2D array representing the grid
- Handles piece placement with gravity simulation
- Provides boundary checking and validation
- Returns defensive copies of state to prevent external mutation
- Key methods: `dropPiece()`, `getNextAvailableRow()`, `isColumnFull()`, `getState()`

**`Game.ts`** - Manages game state and rules
- Orchestrates the Board class
- Tracks current player turn (1 or 2)
- Implements win detection algorithm (checks 4 directions: horizontal, vertical, diagonal-up, diagonal-down)
- Manages game status: 'playing', 'won', 'draw'
- Key methods: `makeMove()`, `checkWinner()`, `reset()`, `isGameOver()`

### Type System (src/types/index.ts)

All game entities are strictly typed:
- `CellValue`: 0 (empty) | 1 (player 1) | 2 (player 2)
- `BoardState`: 2D array of CellValue
- `GameConfig`: Configurable game parameters (rows, cols, connectN)
- `GameState`: Complete game state snapshot
- `GameStatus`: Current game phase

### Constants (src/constants/index.ts)

- `DEFAULT_GAME_CONFIG`: Default 6x7 board with connect-4 rule
- `DIRECTION_VECTORS`: Direction deltas for win detection algorithm
- `PLAYER_COLORS`: UI color scheme for players

## Key Design Principles

### 1. Immutability
Model classes return copies of internal state rather than references. This prevents accidental mutation from the view layer.

```typescript
// Board.getState() returns a copy
getState(): BoardState {
    return this.state.map(row => [...row])
}
```

### 2. Validation Before Mutation
All state-changing operations validate preconditions:
- Check if game is over before accepting moves
- Verify column availability before dropping pieces
- Validate board boundaries

### 3. Single Responsibility
- **Board**: Only handles board data structure
- **Game**: Only handles game rules and turn management
- **Components** (to be built): Only handle rendering and user interaction

### 4. Configuration Driven
Game rules are configurable via `GameConfig`:
- Board dimensions can be customized (default: 6 rows × 7 cols)
- Connect-N value can be changed (default: 4)

## Win Detection Algorithm

The `checkWinner()` method in `Game.ts` implements a directional search:

1. Iterate through each cell on the board
2. For each non-empty cell, check 4 directions:
   - Right: `[0, 1]`
   - Down: `[1, 0]`
   - Diagonal down-right: `[1, 1]`
   - Diagonal down-left: `[1, -1]`
3. Count consecutive pieces of the same player in each direction
4. Return the player immediately when N consecutive pieces are found

**Important**: Only checks forward directions (not backward) to avoid duplicate detection.

## Current State

The project is in active development:

✅ **Completed:**
- Core game logic (Board and Game classes)
- Type system
- Win detection algorithm
- Basic UI rendering of the board

🚧 **In Progress:**
- Interactive gameplay (touch handlers for column selection)
- Player turn indicators
- Win/draw notifications
- Game reset functionality

📋 **Not Yet Implemented:**
- React components in `src/components/`
- Utility functions in `src/utils/`
- Controllers in `src/controllers/`
- Animations (piece dropping, win highlighting)

## Testing Scenarios

`board-scenarios.js` contains pre-defined board states for testing win detection:
- Horizontal wins (bottom, middle)
- Vertical wins (left, center)
- Diagonal wins (both directions)
- Edge cases (almost wins, draws, full board)

Use these scenarios to validate game logic changes.

## Important Notes

### State Management
Currently uses `useState` directly in `App.tsx`. Consider refactoring to:
- Custom hooks (`useGame`) for game state management
- React Context for global game state (if adding features like undo/redo)

### Board Instantiation
The Board class should be instantiated through the Game class, not directly in components. The current `App.tsx` creates a Board directly, which should be refactored to use the Game class.

### Move Validation
`Game.makeMove()` returns boolean:
- `true`: Move was successfully placed (even if game ends)
- `false`: Move rejected (column full, game over, invalid column)

Always check return value before updating UI state.
