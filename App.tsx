import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button, Dimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useState } from "react";
import { useGame } from "./src/hooks/useGame";
import {
  Gesture,
  GestureDetector,
  Directions,
} from "react-native-gesture-handler";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";

const CELL_DIM = 50;
const CELL_GAP = 8;
const COL_WIDTH = CELL_DIM + CELL_GAP;

export default function App() {

  const dragOffset = useSharedValue(0);
  const startColumn = useSharedValue(0);

  const [colNum, setColNum] = useState(0);

  const { boardState, handleMove, currentPlayer } = useGame();
  const pan = Gesture.Pan()
    .minDistance(1)
    .onStart(() => {
      startColumn.value = colNum;
    })
    .onUpdate((e) => {
      const columnMoved = Math.round(e.translationX / COL_WIDTH);
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
      console.log("Double tap!");

      handleMove(colNum);
    })
    .runOnJS(true);

  const animatedHeadersStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragOffset.value * 0.1 }],
  }));

  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        <GestureDetector gesture={Gesture.Simultaneous(doubleTap, pan)}>
          <Animated.View>
            <Animated.View
              key={"Header"}
              style={[styles.row, styles.header, animatedHeadersStyle]}
            >
              {Array(7)
                .fill(0)
                .map((_, colIndex) => (
                  <View
                    key={colIndex}
                    style={[
                      styles.cell,
                      colIndex == colNum &&
                        currentPlayer === 1 &&
                        styles.player1,
                      colIndex == colNum &&
                        currentPlayer === 2 &&
                        styles.player2,
                    ]}
                  ></View>
                ))}
            </Animated.View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
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
