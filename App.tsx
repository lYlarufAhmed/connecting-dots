import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useState } from "react";
import { useGame } from "./src/hooks/useGame";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  ReduceMotion,
  SharedValue,
  runOnJS,
} from "react-native-reanimated";
import { useSound } from "./src/hooks/useSound";

const CELL_DIM = 50;
const CELL_GAP = 8;
const COL_DIM = CELL_DIM + CELL_GAP;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  statusContainer: {},

  board: {
    flexDirection: "column", // Stack rows vertically
    borderWidth: 2,
    borderColor: "#333",
    gap: CELL_GAP,
    padding: 6,
  },
  header: {
    padding: 6,
  },
  row: {
    gap: 8,
    flexDirection: "row", // Place cells horizontally
  },
  cellBorder: {
    borderWidth: 1,
    borderColor: "#999",
  },
  cell: {
    width: CELL_DIM,
    height: CELL_DIM,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 100,
  },
  player1: {
    transform: [],
    backgroundColor: "#ff6b6b", // Red for player 1
  },
  player2: {
    backgroundColor: "#4ecdc4", // Teal for player 2
  },
  cellText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});

function HeaderCell({
  colIndex,
  isActive,
  currentPlayer,
  animatingColumn,
  animateDistance,
}: {
  colIndex: number;
  isActive: boolean;
  currentPlayer: number;
  animatingColumn: SharedValue<number>;
  animateDistance: SharedValue<number>;
}) {
  const animateDropPieceStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          colIndex === animatingColumn.value ? animateDistance.value : 0,
      },
    ],
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

const audioPath = require("./assets/drop_peanut.wav");

export default function App() {
  const dragOffset = useSharedValue(0);
  const startColumn = useSharedValue(0);
  const animateDistance = useSharedValue(0);
  const animatingColumn = useSharedValue(-1);
  const { player } = useSound(audioPath);
  const playAudio = () => {
    player.seekTo(0);
    player.play();
  };

  const [colNum, setColNum] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const {
    boardState,
    handleMove,
    currentPlayer,
    status,
    winner,
    resetGame,
    getNextAvailableRow,
  } = useGame();
  const pan = Gesture.Pan()
    .enabled(!isAnimating)
    .minDistance(1)
    .onStart(() => {
      startColumn.value = colNum;
    })
    .onUpdate((e) => {
      const columnMoved = Math.round(e.translationX / COL_DIM);
      const newColumn = startColumn.value + columnMoved;
      const clampedColumn = Math.max(0, Math.min(6, newColumn));
      setColNum(clampedColumn);
      dragOffset.value = e.translationX;
    })
    .onEnd((e) => {
      // fling at the end to add momentum
      const velocity = e.velocityX;
      const momentumColumns = Math.round(velocity / 1000);

      const finalColumn = colNum + momentumColumns;
      setColNum(Math.max(0, Math.min(6, finalColumn)));
      dragOffset.value = withSpring(0);
    })
    .runOnJS(true);

  const doubleTap = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(2)
    .onStart(() => {
      setIsAnimating(true);
      animatingColumn.value = colNum;

      const destRow = getNextAvailableRow(colNum);
      const columnToMove = colNum; // Capture the column value

      animateDistance.value = withSpring(
        (destRow + 1.1) * COL_DIM,
        {
          stiffness: 240,
          damping: 60,
          mass: 1,
          overshootClamping: false,
          energyThreshold: 6e-9,
          velocity: 30,
          reduceMotion: ReduceMotion.System,
        },
        (finished) => {
          "worklet";
          // runOnJS(playAudio)();
          animateDistance.value = withTiming(0, { duration: 5 });
          runOnJS(handleMove)(columnToMove);
          runOnJS(setIsAnimating)(false);
        }
      );

      playAudio();
    })
    .onEnd(() => {
      // playAudio();
    })
    .runOnJS(true);

  const animatedHeadersStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragOffset.value * 0.1 }],
  }));

  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        {/* Game Status */}
        <View style={styles.statusContainer}>
          {status == "playing" && (
            <Text>{`Player ${currentPlayer}'s turn!`}</Text>
          )}
          {status == "won" && <Text>{`Player ${winner} Won!`}</Text>}
          {status == "draw" && <Text>{"It's a draw!"}</Text>}
          <Button title="New Game" onPress={resetGame} />
        </View>
        <GestureDetector gesture={Gesture.Simultaneous(doubleTap, pan)}>
          <Animated.View>
            {status == "playing" && (
              <Animated.View
                key={"Header"}
                style={[styles.row, styles.header, animatedHeadersStyle]}
              >
                {Array(7)
                  .fill(0)
                  .map((_, colIndex) => (
                    <HeaderCell
                      key={colIndex}
                      colIndex={colIndex}
                      isActive={colIndex === colNum}
                      currentPlayer={currentPlayer}
                      animatingColumn={animatingColumn}
                      animateDistance={animateDistance}
                    />
                  ))}
              </Animated.View>
            )}

            <View style={styles.board}>
              {boardState.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                  {row.map((cell, colIndex) => (
                    <View
                      key={colIndex}
                      style={[
                        styles.cell,
                        styles.cellBorder,
                        cell === 1 && styles.player1,
                        cell === 2 && styles.player2,
                      ]}
                    >
                      {/* <Text style={styles.cellText}>{cell}</Text> */}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}
