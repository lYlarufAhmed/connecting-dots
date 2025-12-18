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
} from "react-native-reanimated";

const { width } = Dimensions.get("screen");

export default function App() {
  const startPosition = useSharedValue(0);

  const [colNum, setColNum] = useState(0);
  const [lastTapTS, setLastTapTS] = useState<number | null>(null);

  const { boardState, handleMove, currentPlayer } = useGame();
  const selectNextCol = () => setColNum((prev) => (prev < 6 ? prev + 1 : 0));
  const selectPrevCol = () => setColNum((prev) => (prev > 0 ? prev - 1 : 6));

  const flingGesture = Gesture.Fling()
    .direction(Directions.RIGHT | Directions.LEFT)
    .onBegin((e) => {
      startPosition.value = e.x;
    })
    .onStart((e) => {
      const diff = e.x - startPosition.value;
      console.log("move ", Math.round((diff / width) * 100));
      if (diff > 0) selectNextCol();
      if (diff < 0) selectPrevCol();
    })
    .runOnJS(true);

  // implement double tap/signle tap
  const singleTap = Gesture.Tap()
    .maxDuration(250)
    .onStart(() => {
      console.log("Single tap!");
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

  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        <GestureDetector gesture={Gesture.Exclusive(doubleTap, flingGesture)}>
          <View>
            <View key={"Header"} style={styles.row}>
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
            </View>
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
          </View>
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
    gap: 8,
    padding: 6,
  },
  control: {
    flexDirection: "row",
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
    width: 50,
    height: 50,

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
