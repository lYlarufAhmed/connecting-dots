# Development Log

This file documents working sessions, design decisions, problems solved, and future improvement ideas.

---

## Session 1: Piece Drop Animation & Sound Effects
**Date:** December 21, 2025  
**Focus:** Implementing smooth piece-dropping animation with sound effects

### Goals Achieved ✅

1. **Piece Drop Animation**
   - Implemented smooth 60fps animation using React Native Reanimated
   - Piece animates from header down to destination row
   - Uses spring physics for natural, satisfying feel
   - Prevents user interaction during animation

2. **Sound Effects Integration**
   - Integrated `expo-audio` for sound playback
   - Created reusable `useSound` hook
   - Plays drop sound when piece lands
   - Works on both simulator and physical devices

3. **Architecture Improvements**
   - Created `HeaderCell` component (avoiding Hooks violations)
   - Added `getNextAvailableRow()` to Game model
   - Proper thread separation (UI thread vs JS thread)

---

### Technical Implementation

#### Animation System

**Key Files Modified:**
- `App.tsx` - Main animation logic and HeaderCell component
- `src/hooks/useGame.ts` - Added `getNextAvailableRow()` method
- `src/hooks/useSound.ts` - New file for audio management

**Shared Values Created:**
```typescript
const animateDistance = useSharedValue(0);    // How far to drop
const animatingColumn = useSharedValue(-1);   // Which column is animating
```

**Animation Flow:**
1. User double-taps on column
2. Calculate destination row: `getNextAvailableRow(colNum)`
3. Calculate pixel distance: `(destRow + 1.1) * COL_DIM`
4. Start spring animation
5. When animation completes:
   - Reset animation values
   - Update game model
   - Play sound effect

**HeaderCell Component Pattern:**
```typescript
function HeaderCell({ 
  colIndex, 
  isActive, 
  currentPlayer, 
  animatingColumn, 
  animateDistance 
}: {
  colIndex: number;
  isActive: boolean;
  currentPlayer: number;
  animatingColumn: SharedValue<number>;
  animateDistance: SharedValue<number>;
}) {
  const animateDropPieceStyle = useAnimatedStyle(() => ({
    transform: [{
      translateY: colIndex === animatingColumn.value ? animateDistance.value : 0,
    }],
  }));

  return (
    <Animated.View
      style={[
        styles.cell,
        isActive && currentPlayer === 1 && styles.player1,
        isActive && currentPlayer === 2 && styles.player2,
        animateDropPieceStyle,
      ]}
    />
  );
}
```

**Why this pattern?**
- Can't use `useAnimatedStyle` inside `.map()` (React Hooks rule violation)
- Extracting to component allows proper hook usage
- Each cell has its own animated style, but only active column animates

#### Sound Integration

**Dependencies Added:**
```bash
npx expo install expo-audio expo-asset
```

**useSound Hook:**
```typescript
// src/hooks/useSound.ts
import { useAudioPlayer } from 'expo-audio';

export const useSound = (soundFile: any) => {
  const player = useAudioPlayer(soundFile);
  return { player };
}
```

**Usage:**
```typescript
const audioSource = require('./assets/drop_peanut.wav');
const { player } = useSound(audioSource);

// In animation callback:
runOnJS(player.play)();
```

**Critical:** Must use `require()` for asset paths, not string paths!

---

### Problems Encountered & Solutions

#### Problem 1: Animation Not Visible
**Symptom:** Double-tap registered but no animation appeared

**Cause:** Conditional style application in array
```typescript
// ❌ This doesn't work
style={[styles.cell, condition && animatedStyle]}
```

**Solution:** Use shared value to control which cell animates
```typescript
// ✅ Always apply style, conditionally set value
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{
    translateY: colIndex === animatingColumn.value ? animateDistance.value : 0
  }]
}));
```

---

#### Problem 2: Audio Not Loading on Device
**Symptom:** Audio worked in simulator but failed on physical device (Expo Go)

**Cause:** Using string path instead of `require()`
```typescript
// ❌ Works in simulator, fails on device
const audioPath = "./assets/drop_peanut.wav";
```

**Solution:** Use `require()` for static asset analysis
```typescript
// ✅ Works everywhere
const audioSource = require('./assets/drop_peanut.wav');
```

**Why:** Metro bundler needs static `require()` calls to include assets in bundle.

---

#### Problem 3: Missing Peer Dependency
**Symptom:** App crashed on device with error about missing module

**Cause:** `expo-audio` requires `expo-asset` peer dependency

**Solution:**
```bash
npx expo install expo-asset
npx expo install --fix  # Fix version mismatches
```

---

#### Problem 4: Audio Not Playing in Animation Callback
**Symptom:** `player.play()` call in callback had no effect

**Cause:** Missing `runOnJS()` wrapper
```typescript
// ❌ Silently fails - wrong thread
(finished) => {
  'worklet';
  player.play();  // This is a JS API, can't call from UI thread
}
```

**Solution:** Wrap in `runOnJS()`
```typescript
// ✅ Bridges from UI thread → JS thread
(finished) => {
  'worklet';
  runOnJS(playAudio)();  // Now executes correctly
}
```

---

#### Problem 5: Visual "Snap" After Drop
**Symptom:** Piece would flash or jump after landing

**Cause:** Resetting `animateDistance.value = 0` while piece still visible

**Solution:** Reset position at START of next animation, not end of previous
```typescript
// In callback - just hide the piece
animatingColumn.value = -1;  // Makes it invisible

// In next animation start - reset position before animating
animateDistance.value = 0;
animatingColumn.value = colNum;
// Then start new animation...
```

---

#### Problem 6: Audio Delay After Visual Landing
**Symptom:** Sound plays 50-100ms after piece visually lands

**Cause:** Thread handoff delay (UI thread → JS thread via `runOnJS`)

**Status:** Known issue with multiple solution approaches (see Future Improvements below)

---

### Learning Outcomes

#### Core Concepts Mastered

**1. Shared Values vs React State**
- `useSharedValue`: High-frequency updates (animations), runs on UI thread
- `useState`: Application state, runs on JS thread, triggers re-renders

**2. Thread Model**
```
UI Thread (60fps)           JS Thread (variable fps)
- Shared values             - React state  
- Animations                - Game logic
- Worklets                  - Audio APIs
         
         runOnJS() bridges UI → JS
```

**3. Worklets**
- Functions that run on UI thread (marked with `'worklet';`)
- Animation callbacks are worklets
- Can read/write shared values freely
- Must use `runOnJS()` to call JS functions

**4. Animation Functions**
- `withSpring()`: Physics-based (natural, bouncy)
- `withTiming()`: Time-based (precise duration)
- `withDelay()`, `withSequence()`: Timing orchestration

**5. Component Extraction Pattern**
When you need hooks inside loops:
- ❌ Don't: Use hooks inside `.map()`
- ✅ Do: Extract to separate component

---

### Configuration & Setup

#### Dependencies Added
```json
{
  "expo-audio": "^1.1.1",
  "expo-asset": "latest"
}
```

#### Files Created/Modified
- ✅ `src/hooks/useSound.ts` - New
- ✅ `src/hooks/useGame.ts` - Added `getNextAvailableRow()`
- ✅ `src/models/Game.ts` - Exposed `getNextAvailableRow()`
- ✅ `App.tsx` - Animation logic + HeaderCell component
- ✅ `assets/drop_peanut.wav` - New sound file

#### Babel Configuration
Verified `babel.config.js` has Reanimated plugin (must be last):
```javascript
plugins: [
  'react-native-reanimated/plugin', // Must be LAST
]
```

---

### Current Animation Parameters

```typescript
// Drop animation
animateDistance.value = withSpring(
  (destRow + 1.1) * COL_DIM,  // Target distance
  {
    stiffness: 240,
    damping: 60,
    mass: 1,
    overshootClamping: false,
    energyThreshold: 6e-9,
    velocity: 30,
    reduceMotion: ReduceMotion.System,
  },
  callback
);

// Reset animation
animateDistance.value = withTiming(0, { duration: 5 });
```

**Constants:**
```typescript
const CELL_DIM = 50;
const CELL_GAP = 8;
const COL_DIM = CELL_DIM + CELL_GAP;  // 58px
```

---

## Future Improvements

### 🔧 Audio Timing Synchronization
**Current Issue:** Sound plays 50-100ms after visual landing due to `runOnJS()` thread handoff delay.

**Priority:** Medium  
**Impact:** User experience (minor delay noticeable but not critical)

#### Option 1: useAnimatedReaction (Best Sync)
Watch animation value and trigger sound when it crosses threshold (95% of target).

**Pros:**
- ✅ Perfectly synchronized with visual
- ✅ Compensates for thread delay automatically

**Cons:**
- ⚠️ More complex code
- ⚠️ Additional state management

**Implementation:**
```typescript
const targetDistance = useSharedValue(0);

useAnimatedReaction(
  () => animateDistance.value,
  (current, previous) => {
    if (
      targetDistance.value > 0 && 
      previous < targetDistance.value * 0.95 && 
      current >= targetDistance.value * 0.95
    ) {
      runOnJS(playAudio)();
    }
  }
);
```

#### Option 2: Pre-calculate Spring Duration + setTimeout
Calculate when spring will finish, schedule sound to play earlier.

**Pros:**
- ✅ Simpler than Option 1
- ✅ Good enough for most cases

**Cons:**
- ⚠️ Spring duration estimation not perfect
- ⚠️ May need tweaking

**Implementation:**
```typescript
const estimateSpringDuration = (config) => {
  const { stiffness, damping, mass } = config;
  return (2 * Math.PI * Math.sqrt(mass / stiffness)) * 1000;
};

const estimatedDuration = estimateSpringDuration(springConfig);
setTimeout(() => playAudio(), estimatedDuration - 80);
```

#### Option 3: Switch to withTiming (Easiest)
Replace spring with timing for exact duration control.

**Pros:**
- ✅ Very simple
- ✅ Precise timing
- ✅ Easy to tweak

**Cons:**
- ⚠️ Loses natural "bouncy" feel

**Implementation:**
```typescript
import { Easing } from 'react-native-reanimated';

const DROP_DURATION = 400;

setTimeout(() => playAudio(), DROP_DURATION - 50);

animateDistance.value = withTiming(
  (destRow + 1.1) * COL_DIM,
  {
    duration: DROP_DURATION,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },
  callback
);
```

**Recommended:** Try Option 3 first (swap spring for timing), then Option 2 if you want spring physics back.

---

### 🎨 Animation Fine-Tuning

#### Drop Distance Calculation
**Current:** `(destRow + 1.1) * COL_DIM`

**Considerations:**
- The `1.1` multiplier adds slight overshoot
- May need adjustment based on header/board padding
- Consider measuring exact pixel distances

**Test values to try:**
- `(destRow + 1.0)` - No overshoot
- `(destRow + 1.05)` - Slight overshoot
- Calculate exact: `destRow * COL_DIM + headerPadding + boardPadding + borders`

#### Spring Parameters Tuning
**Current values work well, but consider:**
- **Faster drop:** Increase `stiffness` (240 → 300)
- **More bounce:** Decrease `dampingRatio` (or adjust `damping`)
- **Heavier feel:** Increase `mass` (1 → 2)

#### Fade-Out Effect (Optional)
Add opacity animation when piece lands:

```typescript
const dropPieceOpacity = useSharedValue(1);

// In callback:
dropPieceOpacity.value = withTiming(0, { duration: 100 }, () => {
  'worklet';
  // Then reset position
  animateDistance.value = 0;
  dropPieceOpacity.value = 1;
});

// In HeaderCell:
opacity: colIndex === animatingColumn.value ? dropPieceOpacity.value : 1
```

---

### 🎵 Sound Enhancement Ideas

#### Multiple Sound Variations
- Different sounds based on drop height
- Pitch variation based on column
- Win/lose sound effects
- Invalid move sound

#### Mute Toggle
```typescript
const [isMuted, setIsMuted] = useState(false);

// In callback:
if (!isMuted) {
  runOnJS(playAudio)();
}

// UI:
<Button 
  title={isMuted ? "🔇" : "🔊"} 
  onPress={() => setIsMuted(!isMuted)} 
/>
```

---

### 🎯 Other Future Features

- **Win animation:** Highlight winning pieces with color pulse
- **Column preview:** Show ghost piece on hover
- **Undo/redo:** With animation reversal
- **AI opponent:** Minimax algorithm
- **Multiplayer:** Network play
- **Custom themes:** Different color schemes

---

## Development Tips & Patterns

### Debugging Reanimated Issues

**1. Animation not working?**
- Check if `'worklet';` directive is present
- Verify you're using `useSharedValue`, not `useState`
- Ensure `useAnimatedStyle` is applied to `Animated.View`, not regular `View`

**2. JS function not executing in callback?**
- Wrap with `runOnJS()`
- Check Metro bundler logs for errors

**3. Simulator works, device doesn't?**
- Check asset loading (use `require()`, not strings)
- Verify all peer dependencies installed
- Test with `npx expo start -c` (clear cache)

### Performance Optimization

**Animation State:**
- Use `useSharedValue` for values that change frequently (60fps)
- Use `useState` only for values that trigger re-renders
- Minimize `runOnJS()` calls (they bridge threads)

**Audio Performance:**
- Pre-load sounds on mount (already done in `useSound`)
- Unload on unmount to prevent memory leaks
- Consider audio pooling for rapid sounds

---

## Session Summary

**What Worked Well:**
- ✅ Component extraction pattern solved Hooks violation elegantly
- ✅ Spring animation feels natural and satisfying
- ✅ Sound integration straightforward with `expo-audio`
- ✅ Thread model clear once explained

**Challenges Overcome:**
- Thread synchronization (UI vs JS)
- Asset loading differences (simulator vs device)
- Animation timing and state management
- Audio playback delay compensation

**Time Investment:**
- Animation implementation: ~60% of session
- Sound integration: ~20% of session
- Debugging device issues: ~15% of session
- Documentation: ~5% of session

**Next Session Ideas:**
- Implement audio timing improvements (try Option 3 first)
- Fix the error related to audio. sometime the audio doesn't play
- Add win animation
- Polish animation parameters
- Add mute toggle

---

*For technical architecture details, see CLAUDE.md*

---

## Session 2: Expo Router Navigation Implementation
**Date:** December 21, 2025  
**Focus:** Multi-game architecture with Expo Router

### Goals Achieved ✅

1. **Expo Router Integration**
   - Installed and configured Expo Router (file-based routing)
   - Migrated from single-file app to multi-screen architecture
   - Proper navigation setup with Stack navigator

2. **Home Screen**
   - Created game hub with welcome message
   - Card-based game list UI
   - Navigation to individual games

3. **Code Reorganization**
   - Moved Connect Four to separate route
   - Maintained all game functionality (animations, sounds, gestures)
   - Scalable structure for adding more games

---

### Technical Implementation

#### File Structure Changes

**New Structure:**
```
app/
├── _layout.tsx          # Root navigation layout
├── index.tsx            # Home screen (game list)
└── connect-four.tsx     # Connect Four game

src/
├── hooks/
├── models/
├── types/
└── constants/

package.json             # main: "expo-router/entry"
```

**Key Files:**

1. **app/_layout.tsx** - Root layout with navigation wrapper
2. **app/index.tsx** - Home screen with game cards
3. **app/connect-four.tsx** - Game screen (moved from App.tsx)

#### Navigation Configuration

**Dependencies Added:**
```json
{
  "expo-router": "~6.0.21",
  "react-native-screens": "~4.16.0",
  "react-native-safe-area-context": "~5.6.0",
  "expo-linking": "~8.0.11",
  "expo-constants": "~18.0.12",
  "expo-asset": "~12.0.12"
}
```

**package.json main entry:**
```json
{
  "main": "expo-router/entry"
}
```

#### Routing Pattern

Expo Router uses file-based routing:
- `app/index.tsx` → `/` (home)
- `app/connect-four.tsx` → `/connect-four`
- `app/_layout.tsx` → Wraps all screens

Navigation is automatic based on file names!

---

### Design Decisions

#### Why Expo Router over React Navigation?

**Advantages:**
- ✅ File-based routing (like Next.js)
- ✅ Auto-discovers routes
- ✅ Less boilerplate
- ✅ Built-in TypeScript support
- ✅ Deep linking by default

#### GestureHandler Wrapper Location

Placed `GestureHandlerRootView` in `_layout.tsx` to wrap entire navigation tree:
- All screens can use gestures
- Single wrapper (cleaner)
- No need to add per-screen

---

### Future Enhancements

#### Adding More Games

To add a new game:
1. Create `app/[game-name].tsx`
2. Add to `GAMES` array in `app/index.tsx`
3. Route automatically registered!

Example:
```typescript
// app/index.tsx
const GAMES: Game[] = [
  {
    id: 'connect-four',
    title: 'Connect Four',
    description: 'Connect 4 dots in a row to win!',
    route: '/connect-four',
    emoji: '🔴',
  },
  {
    id: 'tic-tac-toe',
    title: 'Tic Tac Toe',
    description: 'Classic X and O game!',
    route: '/tic-tac-toe',
    emoji: '❌',
  },
];
```

#### Navigation Customization Ideas

- Custom transitions between screens
- Gestures for swipe-back
- Nested navigation (tabs within games)
- Deep linking to specific games
- Share links to games

---

## Known Issues & Improvements

### 🔧 Audio Reliability Issues

**Status:** Active bug - audio playback unreliable  
**Priority:** High  
**Impact:** User experience degradation

#### Problem Description

**Symptoms:**
1. Audio sometimes doesn't play when piece drops
2. CoreAudio warnings in iOS simulator (harmless but noisy)
3. Intermittent playback failures

**Error Logs (iOS Simulator):**
```
[MediaToolbox] FigFilePlayer signalled err=-12864
[CoreAudio] HALC_ProxyIOContext::_StartIO(): Start failed
[AudioToolbox] Audio device 131: error 0 fetching sample rate
```

**Root Causes:**
1. **expo-audio player state management**
   - Player may not be ready when `play()` called
   - Race condition between load and play
   - No error handling in `playAudio()` function

2. **iOS Simulator audio issues**
   - Simulator audio system less reliable than device
   - CoreAudio warnings are simulator-specific
   - May not reflect real device behavior

3. **Current implementation weaknesses:**
   ```typescript
   const playAudio = () => {
     player.seekTo(0);  // ❌ No await, no error handling
     player.play();     // ❌ May fail silently
   };
   ```

#### Solution Options

##### Option 1: Add Proper Async/Await + Error Handling (Quick Fix)

**Priority:** High - Do this first!

**Current code:**
```typescript
// app/connect-four.tsx line 115-118
const playAudio = () => {
  player.seekTo(0);
  player.play();
};
```

**Improved version:**
```typescript
const playAudio = async () => {
  try {
    if (player) {
      await player.seekTo(0);
      await player.play();
    }
  } catch (error) {
    console.warn('Audio playback failed:', error);
    // Silently fail - don't crash the game
  }
};
```

**Update callsite:**
```typescript
// In doubleTap gesture handler
playAudio(); // Already works - function is async but we don't await
```

**Benefits:**
- ✅ Prevents crashes
- ✅ Handles player not ready
- ✅ Easy to implement
- ✅ Doesn't block animation

**Implementation:**
- File: `app/connect-four.tsx`
- Lines: 115-118
- Add try/catch wrapper
- Make function async

---

##### Option 2: Switch to expo-av (More Stable)

**Priority:** Medium - If Option 1 doesn't help

`expo-av` is more mature and has better error handling than `expo-audio`.

**New useSound hook:**
```typescript
// src/hooks/useSound.ts
import { Audio } from 'expo-av';
import { useEffect, useRef } from 'react';

export function useSound(soundFile: any) {
  const sound = useRef<Audio.Sound | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSound = async () => {
      try {
        const { sound: loadedSound } = await Audio.Sound.createAsync(soundFile);
        if (isMounted) {
          sound.current = loadedSound;
          setIsLoaded(true);
        }
      } catch (error) {
        console.warn('Failed to load sound:', error);
      }
    };
    
    loadSound();

    return () => {
      isMounted = false;
      sound.current?.unloadAsync();
    };
  }, [soundFile]);

  const play = async () => {
    if (!isLoaded || !sound.current) {
      console.warn('Sound not loaded yet');
      return;
    }

    try {
      await sound.current.setPositionAsync(0);
      await sound.current.playAsync();
    } catch (error) {
      console.warn('Playback failed:', error);
    }
  };

  return { play, isLoaded };
}
```

**Benefits:**
- ✅ More reliable
- ✅ Better error handling
- ✅ Proper async lifecycle
- ✅ Load state tracking

**Migration needed:**
- Install: `npx expo install expo-av`
- Update `src/hooks/useSound.ts`
- Update `app/connect-four.tsx` usage

---

##### Option 3: Pre-load and Keep Loaded (Performance)

**Priority:** Low - Optimization

Instead of seeking to 0 each time, keep multiple sound instances:

```typescript
// src/hooks/useSoundPool.ts
import { Audio } from 'expo-av';
import { useEffect, useRef } from 'react';

export function useSoundPool(soundFile: any, poolSize = 3) {
  const soundPool = useRef<Audio.Sound[]>([]);
  const currentIndex = useRef(0);

  useEffect(() => {
    const loadSounds = async () => {
      const promises = Array(poolSize).fill(null).map(async () => {
        const { sound } = await Audio.Sound.createAsync(soundFile);
        return sound;
      });
      soundPool.current = await Promise.all(promises);
    };

    loadSounds();

    return () => {
      soundPool.current.forEach(sound => sound.unloadAsync());
    };
  }, [soundFile, poolSize]);

  const play = async () => {
    const sound = soundPool.current[currentIndex.current];
    if (sound) {
      try {
        await sound.setPositionAsync(0);
        await sound.playAsync();
        currentIndex.current = (currentIndex.current + 1) % poolSize;
      } catch (error) {
        console.warn('Playback failed:', error);
      }
    }
  };

  return { play };
}
```

**Benefits:**
- ✅ No seek time
- ✅ Multiple rapid plays supported
- ✅ Better performance

**Cons:**
- ⚠️ More memory usage
- ⚠️ Overkill for single game

---

##### Option 4: Use Haptic Feedback as Fallback

**Priority:** Low - Enhancement

Add vibration when sound fails:

```typescript
import * as Haptics from 'expo-haptics';

const playAudioWithHaptic = async () => {
  try {
    await player.seekTo(0);
    await player.play();
  } catch (error) {
    // Fallback to haptic
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
};
```

**Benefits:**
- ✅ Always provides feedback
- ✅ Works when audio fails
- ✅ Enhances UX on devices

---

### Recommended Implementation Order

**Phase 1: Quick Fixes (Do Now)**
1. ✅ Implement Option 1 (async/await + try/catch)
2. ✅ Test on physical device (not just simulator)
3. ✅ Add logging to track failures

**Phase 2: If Issues Persist**
1. Implement Option 2 (switch to expo-av)
2. Add load state checking
3. Better error messages

**Phase 3: Optimization (Later)**
1. Sound pooling if needed
2. Haptic feedback enhancement
3. Performance profiling

---

### Testing Checklist

Before considering audio "fixed":
- [ ] Test on iOS simulator
- [ ] Test on iOS physical device
- [ ] Test on Android simulator
- [ ] Test on Android physical device
- [ ] Test rapid consecutive drops (stress test)
- [ ] Test after app backgrounding
- [ ] Check for memory leaks (long play session)

---

### Debug Commands

```bash
# Clear Metro cache
npx expo start -c

# Check audio file is bundled
ls -la .expo/web/cache/development/metro-*/assets/

# Run with verbose logging
EXPO_DEBUG=true npx expo start
```

---

*See CLAUDE.md for audio architecture details*
