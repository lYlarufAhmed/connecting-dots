# TODO: Connect Four Game Development Plan

## Development Phases

This project will be developed in 3 main phases:
1. **Phase 1: Colors, Theming & UI/UX** - Visual design updates
2. **Phase 2: Human vs Machine** - AI opponent implementation
3. **Phase 3: Additional Features** - Navigation, undo, settings, etc.

---

# PHASE 1: Colors, Theming & UI/UX 🎨

**Goal:** Transform the visual design to match the target screenshots with proper theming and styling.

## 1.1 Color Scheme & Background

- [ ] **Update background color to dark green**
  - Current: White (`#fff`)
  - Target: Dark green (`#1a4d2e` or similar dark forest green)
  - Optional: Add subtle texture/pattern
  - File: `App.tsx` - `styles.container.backgroundColor`

- [ ] **Update player colors**
  - Player 1: Keep coral/salmon red (`#ff6b6b` or adjust to `#e74c3c`)
  - Player 2: Change from teal to yellow/gold (`#f4d03f` or `#f39c12`)
  - Files: `App.tsx` - `styles.player1`, `styles.player2`
  - Also update: `src/constants/index.ts` if `PLAYER_COLORS` exists

## 1.2 Wooden Board Design

- [ ] **Replace board border with wooden background**
  - Current: Black border (`#333`) with padding
  - Target: Brown/tan wooden board (`#C19A6B`, `#D2B48C`, or similar)
  - Remove harsh border, add rounded corners
  - File: `App.tsx` - `styles.board`

- [ ] **Update cell styling for wooden aesthetic**
  - Current: Gray borders on cells (`#999`)
  - Target: Cells as circular holes/slots in wood
  - Remove cell borders or use very subtle dark shadows
  - Add depth with inner shadow effect
  - File: `App.tsx` - `styles.cell`, `styles.cellBorder`

## 1.3 Game Stats Display

- [ ] **Implement game timer**
  - Create `src/hooks/useTimer.ts` hook
  - Display format: `Time: MM:SS` (e.g., "Time: 00:21")
  - Functionality: start on first move, pause on game end, reset on new game
  - Return: `time` (seconds), `formattedTime`, `start()`, `pause()`, `reset()`

- [ ] **Add move counter to game state**
  - Update `src/models/Game.ts` or `src/hooks/useGame.ts`
  - Track total moves made
  - Increment on each valid move
  - Reset on new game
  - Expose via `useGame` hook

- [ ] **Create stats display component**
  - New file: `src/components/StatsDisplay.tsx`
  - Position: Top center of screen
  - Layout: Horizontal bar with `Time: MM:SS` (left) | `Moves: N` (right)
  - Styling: Dark semi-transparent background, white text
  - Props: `time: string`, `moves: number`

## 1.4 Player Turn Indicator

- [ ] **Redesign turn indicator text**
  - Current: "Player 1's turn!"
  - Target: "Player 1's move" (larger, more prominent)
  - Position: Centered above the board
  - Styling: White text, larger font size (~20-24px), medium weight

## 1.5 Game Over Modal

- [ ] **Create GameOverModal component**
  - New file: `src/components/GameOverModal.tsx`
  - Props: `visible`, `winner`, `moves`, `time`, `players`, `difficulty`, `onUndo`, `onNewGame`, `onHome`, `onFeedback`
  - Layout:
    ```
    [Dark overlay background]
      [Modal container - dark bg with border]
        "You've won!" (or "It's a draw!")
        ─────────────────
        MOVES          30
        TIME           00:02:20
        NUMBER OF PLAYERS    1 player
        DIFFICULTY     hard
        ─────────────────
        [Undo button]
        [New game button]
        [Home button]
        [Rate and feedback button]
    ```

- [ ] **Style the modal**
  - Background overlay: `rgba(0, 0, 0, 0.7)`
  - Modal box: Dark background (`#2c3e50` or similar), border
  - Title: Large white text, centered
  - Stats: 2-column layout, labels in gray/white, values in orange/yellow
  - Buttons: Orange/brown background (`#e67e22`), white text, stacked vertically
  - Add subtle animations (fade in, scale up)

## 1.6 Bottom Navigation Bar

- [ ] **Create BottomNav component**
  - New file: `src/components/BottomNav.tsx`
  - Position: Fixed at bottom of screen
  - Layout (left to right):
    - Left side: Home icon, Settings icon
    - Right side: New game icon (refresh), Undo icon (curved arrow)
  - Styling: Transparent/dark background, icon buttons
  - Props: `onHome`, `onSettings`, `onNewGame`, `onUndo`, `canUndo: boolean`

- [ ] **Install icon library**
  - Run: `npx expo install @expo/vector-icons`
  - Icons needed: home, settings (cog), refresh, undo
  - Use `Ionicons` from `@expo/vector-icons`

- [ ] **Create IconButton component** (reusable)
  - New file: `src/components/IconButton.tsx`
  - Props: `icon: string`, `iconFamily: string`, `label?: string`, `onPress`, `disabled?: boolean`, `size?: number`
  - Styling: Circular or square button, icon color white/light
  - Add press animation (scale down)

## 1.7 Typography & Polish

- [ ] **Update text styles globally**
  - Ensure all text is readable on dark green background
  - Use white or light colors for primary text
  - Use orange/yellow for accent text (stats values, highlights)
  - Consistent font sizes and weights

- [ ] **Add subtle animations**
  - Modal fade in/out
  - Button press feedback (scale down)
  - Smooth transitions

## Phase 1 Testing Checklist

After completing Phase 1, verify:
- [ ] Background is dark green and visually appealing
- [ ] Board has wooden appearance with proper cell styling
- [ ] Player colors are red and yellow
- [ ] Timer displays correctly and updates every second
- [ ] Move counter increments on each move
- [ ] Stats display is visible and properly positioned
- [ ] Turn indicator is clear and prominent
- [ ] Game over modal appears with correct data
- [ ] Modal buttons are functional
- [ ] Bottom nav bar is positioned correctly
- [ ] All icons are visible and clickable
- [ ] Visual design closely matches target screenshots
- [ ] No regression in game logic or animations

---

# PHASE 2: Human vs Machine (AI Opponent) 🤖

**Goal:** Implement single-player mode with AI opponent and difficulty levels.

## 2.1 AI Architecture

- [ ] **Create AIPlayer model**
  - New file: `src/models/AIPlayer.ts`
  - Interface: `makeMove(board: BoardState, difficulty: Difficulty): number`
  - Return column number for AI's move
  - Follow Model-View separation pattern

- [ ] **Define difficulty levels**
  - Add to `src/types/index.ts`: `type Difficulty = 'easy' | 'medium' | 'hard'`
  - Easy: Random valid moves
  - Medium: Basic strategy (block wins, take wins)
  - Hard: Minimax algorithm with alpha-beta pruning

## 2.2 AI Strategy Implementation

### Easy Difficulty
- [ ] **Implement random move selection**
  - Get all valid columns
  - Select random column
  - No strategic thinking

### Medium Difficulty
- [ ] **Implement basic strategic AI**
  - Priority 1: Check if AI can win in next move → take it
  - Priority 2: Check if opponent can win in next move → block it
  - Priority 3: Prefer center columns
  - Priority 4: Random valid move

### Hard Difficulty
- [ ] **Implement Minimax algorithm**
  - Recursive game tree search
  - Evaluation function for board states
  - Alpha-beta pruning for optimization
  - Look-ahead depth: 6-8 moves
  - Heuristics: center control, threat detection, win patterns

- [ ] **Add position evaluation heuristics**
  - Center column preference
  - Detect potential winning sequences
  - Count threats (3-in-a-row with open end)
  - Penalize opponent's strong positions

## 2.3 Game Mode Management

- [ ] **Add game mode to game configuration**
  - Update `src/types/index.ts`: Add `GameMode = 'pvp' | 'pve'` (player vs player / player vs environment)
  - Update `GameConfig` type to include `mode: GameMode`, `difficulty?: Difficulty`
  - Store in game state

- [ ] **Update Game model for AI integration**
  - File: `src/models/Game.ts`
  - Add `gameMode` and `difficulty` to constructor
  - Add `isAITurn()` method: returns true if current player is AI (player 2 in PvE mode)
  - Keep game logic pure (no AI execution in Game model)

- [ ] **Update useGame hook for AI turns**
  - File: `src/hooks/useGame.ts`
  - After human move, check if it's AI's turn
  - If AI turn: trigger AI move with delay (500-1000ms for realism)
  - Use `useEffect` to watch `currentPlayer` and `gameMode`
  - Execute AI move: `const col = AIPlayer.makeMove(boardState, difficulty); handleMove(col);`

## 2.4 Settings Screen/Modal

- [ ] **Create SettingsModal component**
  - New file: `src/components/SettingsModal.tsx`
  - Props: `visible`, `settings`, `onSave`, `onCancel`
  - Options:
    - Game Mode: "2 Players" vs "vs Computer"
    - Difficulty: "Easy" | "Medium" | "Hard" (only shown if vs Computer)
    - Sound: On/Off toggle
  - Styling: Match game over modal style

- [ ] **Implement settings state management**
  - Option 1: React Context (`src/context/SettingsContext.tsx`)
  - Option 2: Simple state in App.tsx passed down
  - Default settings: `{ mode: 'pvp', difficulty: 'medium', sound: true }`
  - Pass settings to `useGame` hook initialization

- [ ] **Wire up settings modal to bottom nav**
  - Settings icon opens modal
  - Save settings → close modal → restart game with new settings
  - Cancel → close modal without changes

## 2.5 Home Screen

- [ ] **Create HomeScreen component**
  - New file: `src/screens/HomeScreen.tsx`
  - Layout:
    - Game title/logo: "Connecting Dots" or "Connect Four"
    - "New Game" button (primary)
    - "Settings" button (secondary)
    - Optional: "How to Play" button
  - Styling: Dark green background, wooden buttons
  - Props: `onNewGame`, `onSettings`

- [ ] **Add screen navigation**
  - State in App.tsx: `screen: 'home' | 'game'`
  - Show `HomeScreen` when `screen === 'home'`
  - Show game board when `screen === 'game'`
  - Bottom nav "Home" button → navigate to home screen

## Phase 2 Testing Checklist

After completing Phase 2, verify:
- [ ] Settings modal opens and closes correctly
- [ ] Can switch between 2-player and vs Computer modes
- [ ] Difficulty selector appears only in vs Computer mode
- [ ] Easy AI makes random valid moves
- [ ] Medium AI blocks wins and takes wins
- [ ] Hard AI is challenging and strategic
- [ ] AI moves have realistic delay (not instant)
- [ ] AI turn doesn't freeze UI
- [ ] Game ends correctly when AI wins
- [ ] Settings persist during game session
- [ ] Home screen is accessible and functional
- [ ] Can start new game from home screen
- [ ] Navigation between screens works smoothly

---

# PHASE 3: Additional Features ✨

**Goal:** Add quality-of-life features and polish the user experience.

## 3.1 Undo Functionality

- [ ] **Add move history to Game model**
  - Update `src/models/Game.ts`
  - Store history: `Array<{ column: number, player: number, row: number }>`
  - Track in `makeMove()` before updating state

- [ ] **Implement undo method**
  - Add `Game.undoMove(): boolean`
  - Pop last move from history
  - Restore board state (remove piece)
  - Switch current player back
  - Return `false` if no moves to undo

- [ ] **Update useGame hook for undo**
  - Add `undoMove()` method to hook
  - Decrement move counter
  - Sync state after undo
  - Return `canUndo: boolean` (history length > 0)

- [ ] **Wire up undo button**
  - Bottom nav undo button → calls `undoMove()`
  - Disable button when `!canUndo`
  - Game over modal undo button → undo last move → resume game

- [ ] **Undo limitations in PvE mode**
  - In vs Computer mode, undo should remove both AI and player moves
  - Or: Only allow undo before AI moves
  - Decide on UX and implement

## 3.2 Persistent Settings (Optional)

- [ ] **Install AsyncStorage**
  - Run: `npx expo install @react-native-async-storage/async-storage`

- [ ] **Save settings to device storage**
  - Create `src/utils/storage.ts` helper
  - Functions: `saveSettings()`, `loadSettings()`
  - Store JSON of settings object

- [ ] **Load settings on app start**
  - In App.tsx `useEffect` on mount
  - Load saved settings → set state
  - Fallback to defaults if none found

## 3.3 Rate & Feedback

- [ ] **Implement feedback button action**
  - Options:
    - Open email client: `Linking.openURL('mailto:feedback@example.com')`
    - Open app store review page
    - Open in-app form/modal
  - Add handler to GameOverModal "Rate and feedback" button

## 3.4 Win Animation (Optional)

- [ ] **Highlight winning pieces**
  - In Game model: track winning cells in `checkWinner()`
  - Return: `winningCells: Array<{row, col}>` or `null`
  - Expose via `useGame` hook

- [ ] **Animate winning sequence**
  - Use Reanimated to pulse/glow winning pieces
  - Change color or scale up slightly
  - Loop animation while game over modal is visible

## 3.5 Sound Improvements

- [ ] **Add multiple sound effects**
  - Drop piece sound (already implemented)
  - Win sound (celebratory)
  - Lose sound (sad trombone)
  - Draw sound
  - Button click sound

- [ ] **Respect sound setting**
  - Only play sounds if `settings.sound === true`
  - Pass setting to sound hook or check before playing

## 3.6 Polish & Refinements

- [ ] **Add background texture** (optional)
  - Create or download green fabric/felt texture
  - Store in `assets/background.png`
  - Use as background image in container

- [ ] **Add wooden texture to board** (optional)
  - Create or download wood grain texture
  - Apply to board background
  - Ensure cells remain visible

- [ ] **Custom fonts** (optional)
  - Install `expo-font`
  - Load custom font (e.g., bold sans-serif for titles)
  - Apply to headings and buttons

- [ ] **Responsive design improvements**
  - Test on different screen sizes (phone, tablet)
  - Scale board size based on screen dimensions
  - Ensure modal fits on small screens
  - Adjust font sizes for readability

- [ ] **Loading screen** (optional)
  - Show splash screen while loading assets
  - Fade in to home screen when ready

## Phase 3 Testing Checklist

After completing Phase 3, verify:
- [ ] Undo works correctly in both PvP and PvE modes
- [ ] Move history is accurate
- [ ] Settings persist across app restarts (if implemented)
- [ ] Feedback button opens expected action
- [ ] Win animation displays correctly (if implemented)
- [ ] All sounds play at appropriate times
- [ ] Sound can be toggled on/off
- [ ] Background textures look good (if implemented)
- [ ] App is responsive on different screen sizes
- [ ] No performance issues or lag
- [ ] All features work together without conflicts

---

## 🔧 Technical Notes

### Code Organization
- Follow Model-View pattern from CLAUDE.md
- Keep game logic in `src/models/`
- Keep UI in `src/components/` and `src/screens/`
- Use hooks in `src/hooks/` for state management
- Extract constants to `src/constants/`

### Animation Best Practices
- Use React Native Reanimated for all animations
- Animated values on UI thread (SharedValue)
- Use `runOnJS()` when calling JS functions from worklets
- Extract animated components to avoid Hooks violations in `.map()`

### Testing Strategy
- Test each phase thoroughly before moving to next
- Test on both iOS and Android
- Test on physical devices, not just simulator
- Verify 60fps animations
- Check memory usage and performance

### Performance Considerations
- Minimax AI can be slow; consider web worker or limit depth
- Debounce rapid user inputs
- Optimize re-renders (React.memo for components)
- Lazy load screens if needed

---

## 📚 Reference Files

- **Current implementation:** `App.tsx`
- **Game logic:** `src/models/Game.ts`, `src/models/Board.ts`
- **Hooks:** `src/hooks/useGame.ts`, `src/hooks/useSound.ts`
- **Types:** `src/types/index.ts`
- **Constants:** `src/constants/index.ts`
- **Architecture guide:** `CLAUDE.md`
- **Development history:** `DEVELOPMENT_LOG.md`

---

## 🎯 Current Focus: PHASE 1

**Next Steps:**
1. Update background color to dark green
2. Update player colors (red, yellow)
3. Style board with wooden appearance
4. Implement timer hook
5. Add move counter to game state
6. Create stats display component
7. Update turn indicator styling
8. Create game over modal
9. Create bottom navigation bar
10. Install and integrate icons

Start with the color updates as they're quick wins and will immediately transform the visual appearance.
