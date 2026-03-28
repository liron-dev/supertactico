import React from "react";
import { BOARD_ROWS, BOARD_COLS } from "../constants/map";
import { CellView } from "./CellView";

export const CELL_SIZE = 52;

export function Board() {
  const cells: React.ReactNode[] = [];

  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      cells.push(<CellView key={`${row}-${col}`} row={row} col={col} />);
    }
  }

  return (
    <div
      style={{
        width: BOARD_COLS * CELL_SIZE,
        height: BOARD_ROWS * CELL_SIZE,
        position: "relative",
      }}
    >
      {cells}
    </div>
  );
}
