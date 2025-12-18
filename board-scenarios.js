// Connect Four Board Scenarios (7 columns x 6 rows)
// 0 = empty, 1 = player 1, 2 = player 2
// Board is represented from top (row 0) to bottom (row 5)

const boardScenarios = {
  // Horizontal wins
  horizontalWinBottom: [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0], // Player 1 wins horizontally at bottom
  ],

  horizontalWinMiddle: [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 2, 2, 2, 2, 0, 0], // Player 2 wins horizontally in middle
    [0, 1, 1, 2, 1, 0, 0],
    [0, 2, 1, 1, 2, 0, 0],
  ],

  // Vertical wins
  verticalWinLeft: [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0], // Player 1 wins vertically
    [1, 0, 0, 0, 0, 0, 0],
    [1, 2, 0, 0, 0, 0, 0],
    [1, 2, 0, 0, 0, 0, 0],
  ],

  verticalWinCenter: [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 0, 0, 0], // Player 2 wins vertically in center
    [0, 0, 0, 2, 0, 0, 0],
    [0, 1, 0, 2, 0, 0, 0],
    [0, 1, 1, 2, 0, 0, 0],
  ],

  // Diagonal wins (bottom-left to top-right)
  diagonalWinUpRight: [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0], // Player 1 wins diagonally
    [0, 0, 1, 2, 0, 0, 0],
    [0, 1, 2, 2, 0, 0, 0],
    [1, 2, 2, 1, 0, 0, 0],
  ],

  // Diagonal wins (top-left to bottom-right)
  diagonalWinDownRight: [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 0, 0, 0, 0], // Player 2 wins diagonally
    [0, 0, 1, 2, 0, 0, 0],
    [0, 0, 1, 1, 2, 0, 0],
    [0, 0, 1, 1, 1, 2, 0],
  ],

  // Complex scenarios
  almostWinHorizontal: [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 0], // Player 1 has 3 in a row (not a win)
  ],

  almostWinVertical: [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 2, 0, 0, 0, 0, 0], // Player 2 has 3 in a column
    [0, 2, 0, 0, 0, 0, 0],
    [0, 2, 0, 0, 0, 0, 0],
  ],

  multipleThreats: [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 0],
    [0, 2, 1, 2, 0, 1, 0],
    [0, 2, 2, 1, 1, 1, 0], // Multiple potential wins
  ],

  fullDraw: [
    [1, 2, 1, 2, 1, 2, 1],
    [2, 1, 2, 1, 2, 1, 2],
    [1, 2, 1, 2, 1, 2, 1],
    [2, 1, 2, 1, 2, 1, 2],
    [1, 2, 1, 2, 1, 2, 1],
    [2, 1, 2, 1, 2, 1, 2], // Full board with no winner
  ],

  emptyBoard: [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ],

  edgeCaseDiagonalTopRight: [
    [0, 0, 0, 1, 0, 0, 0], // Diagonal win at edge
    [0, 0, 1, 2, 0, 0, 0],
    [0, 1, 2, 2, 0, 0, 0],
    [1, 2, 2, 1, 0, 0, 0],
    [2, 1, 1, 2, 0, 0, 0],
    [1, 2, 1, 2, 0, 0, 0],
  ],

  edgeCaseDiagonalBottomLeft: [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0], // Diagonal win starting from left edge
    [1, 2, 0, 0, 0, 0, 0],
    [1, 1, 2, 0, 0, 0, 0],
    [1, 1, 1, 2, 0, 0, 0],
  ],
};



// Helper function to print board in a readable format
function printBoard(board, name) {
  console.log(`\n${name}:`);
  console.log("  0 1 2 3 4 5 6");
  board.forEach((row, idx) => {
    console.log(`${idx} ${row.join(" ")}`);
  });
}

function main(board, N = 4) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      let cell = board[r][c];
      if (cell !== 0) {
        for ([dr, dc] of directions) {
          let count = 1;
          let i = 1;
          while (i < 4) {
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
}

// Print all scenarios
// Object.keys(boardScenarios).forEach((name) => {
//   printBoard(boardScenarios[name], name);
//   console.log(`Winner: ${main(boardScenarios[name])}`);
// });

module.exports = boardScenarios;
