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
├── hooks/          - Custom React hooks (useGame, useSound)
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
- Key methods: `makeMove()`, `checkWinner()`, `reset()`, `isGameOver()`, `getNextAvailableRow()`

### Hooks Layer (src/hooks/)

**`useGame.ts`** - Game state management hook
- Wraps Game model instance in React state
- Provides methods: `handleMove()`, `resetGame()`, `getNextAvailableRow()`
- Syncs model state with React state after each operation
- Returns: `boardState`, `currentPlayer`, `winner`, `status`, and methods

**`useSound.ts`** - Audio playback hook
- Encapsulates `expo-audio` player lifecycle
- Loads audio file on mount, unloads on unmount
- Returns player instance for flexible control
- Usage: `const { player } = useSound(require('./path/to/sound.wav'))`

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
- **Hooks**: Encapsulate reusable logic (state, audio)
- **Components**: Only handle rendering and user interaction

### 4. Configuration Driven
Game rules are configurable via `GameConfig`:
- Board dimensions can be customized (default: 6 rows × 7 cols)
- Connect-N value can be changed (default: 4)

## Animation Architecture (React Native Reanimated)

### Thread Model

The app uses React Native Reanimated for 60fps animations:

```
┌─────────────────────┐         ┌─────────────────────┐
│   UI Thread         │         │   JS Thread         │
│   (60fps worklets)  │         │   (React & JS APIs) │
├─────────────────────┤         ├─────────────────────┤
│ Shared Values ✅    │         │ React State ✅      │
│ withSpring ✅       │         │ Game Logic ✅       │
│ withTiming ✅       │         │ Audio APIs ✅       │
│ useAnimatedStyle ✅ │         │                     │
│                     │         │                     │
│   runOnJS() ────────┼────────→│ Bridge to call      │
│   (required for)    │         │ JS functions        │
└─────────────────────┘         └─────────────────────┘
```

### Component Pattern for Animated Lists

When animating items in a list, extract to a separate component to avoid React Hooks violations:

**❌ Wrong:** Using `useAnimatedStyle` inside `.map()`
```typescript
{items.map((item, index) => {
  const style = useAnimatedStyle(() => ({ ... })); // Hooks rule violation!
  return <Animated.View style={style} />;
})}
```

**✅ Correct:** Extract to component
```typescript
function AnimatedItem({ index, animatingIndex, animateValue }) {
  const style = useAnimatedStyle(() => ({
    transform: [{
      translateY: index === animatingIndex.value ? animateValue.value : 0
    }]
  }));
  return <Animated.View style={style} />;
}

// In parent:
{items.map((item, index) => (
  <AnimatedItem key={index} index={index} {...props} />
))}
```

**Example in codebase:** `HeaderCell` component in `App.tsx`

### Worklets and runOnJS

**Worklets** are functions that run on the UI thread (marked with `'worklet';` directive).

**Critical pattern:** Always use `runOnJS()` when calling JS functions from worklets:

```typescript
animateDistance.value = withSpring(targetValue, config, (finished) => {
  'worklet';  // This callback runs on UI thread
  
  // ✅ Shared values - OK
  animateDistance.value = 0;
  
  // ✅ JS functions - need runOnJS
  runOnJS(handleMove)(columnToMove);
  runOnJS(setIsAnimating)(false);
  runOnJS(playAudio)();
});
```

**Common mistake:** Calling JS functions without `runOnJS()` will silently fail (no error, just doesn't execute).

## Asset Loading (Expo)

### Static Assets (Audio, Images)

**❌ Wrong:** String paths don't work on physical devices
```typescript
const audioPath = "./assets/sound.wav";
useSound(audioPath);  // Works in simulator, fails on device
```

**✅ Correct:** Use `require()` for static analysis
```typescript
const audioSource = require('./assets/sound.wav');
useSound(audioSource);  // Works everywhere
```

**Why:** Metro bundler needs static `require()` calls to include assets in the bundle.

### Dependencies

Audio requires peer dependency:
```bash
npx expo install expo-audio expo-asset
```

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
- Interactive gameplay with gesture handlers
- Piece drop animation (React Native Reanimated)
- Sound effects integration (expo-audio)
- Custom hooks (useGame, useSound)
- Player turn indicators
- Win/draw notifications
- Game reset functionality

🚧 **Known Issues:**
- Audio timing has ~50-100ms delay due to thread handoff (see DEVELOPMENT_LOG.md for improvement options)

📋 **Not Yet Implemented:**
- React components in `src/components/` (using inline components currently)
- Utility functions in `src/utils/`
- Controllers in `src/controllers/`
- Win highlight animation
- Undo/redo functionality

## Testing Scenarios

`board-scenarios.js` contains pre-defined board states for testing win detection:
- Horizontal wins (bottom, middle)
- Vertical wins (left, center)
- Diagonal wins (both directions)
- Edge cases (almost wins, draws, full board)

Use these scenarios to validate game logic changes.

## Important Notes

### State Management
- Uses custom `useGame` hook for game state management
- Game model instance stored in `useRef` to persist across renders
- State synced to React after each game operation

### Move Validation
`Game.makeMove()` returns boolean:
- `true`: Move was successfully placed (even if game ends)
- `false`: Move rejected (column full, game over, invalid column)

Always check return value before updating UI state.

### Animation Model Updates
When animating, update the model **after** animation completes, not before:
1. User triggers move
2. Animation plays (visual feedback)
3. Animation completes → update game model → React re-renders

This prevents visual glitches and ensures smooth UX.

### Expo Configuration

**babel.config.js** must include Reanimated plugin (MUST be last):
```javascript
plugins: [
  'react-native-reanimated/plugin', // Must be last!
]
```

### Testing on Devices
- Always test on physical device, not just simulator
- Expo Go works for this project (all dependencies compatible)
- Asset loading behaves differently on simulator vs device

## Development Log

See `DEVELOPMENT_LOG.md` for session-by-session development history and future improvement tasks.
