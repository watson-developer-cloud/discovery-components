import { isSideBySideOnLine } from '../common/bboxUtils';
import { TextLayoutCell, TextLayoutCellBase } from '../textLayout/types';

export class CellProvider {
  private readonly skippedCells: TextLayoutCellBase[] = [];
  private cells: TextLayoutCellBase[]; // make sure to handle this as immutable array
  private cursor: number = 0;

  constructor(cells: TextLayoutCellBase[]) {
    this.cells = [...cells];
  }

  hasNext() {
    while (this.cursor < this.cells.length) {
      const cell = this.cells[this.cursor];
      if (cell.text.trim().length !== 0) {
        break;
      }
      this.skip();
    }
    return this.cursor < this.cells.length;
  }

  /** get cells on a line */
  private getNextCells = (() => {
    let lastCells: TextLayoutCellBase[] | null = null;
    let lastCursor: number | null = null;
    let lastResult: TextLayoutCellBase[] | null = null;

    return () => {
      if (lastResult && lastCells === this.cells && lastCursor === this.cursor) {
        return lastResult;
      }

      const result: TextLayoutCellBase[] = [];
      let lastCell: TextLayoutCell | null = null;
      for (let i = this.cursor; i < this.cells.length; i += 1) {
        const currentBox = this.cells[i];
        // maybe we need to break this loop by big box change
        const { cell: baseCurrentCell } = currentBox.getNormalized();
        if (lastCell && !isSideBySideOnLine(lastCell.bbox, baseCurrentCell.bbox)) {
          break;
        }
        result.push(currentBox);
        lastCell = baseCurrentCell;
      }
      lastCells = this.cells;
      lastCursor = this.cursor;
      lastResult = result;

      return result;
    };
  })();

  /** get text from cells on a line */
  getNextText() {
    const nextCells = this.getNextCells();
    const texts = nextCells.map(cell => cell.text);
    return { texts, nextCellIndex: this.cursor };
  }

  /** consume first n chars */
  consume(length: number): TextLayoutCellBase[] {
    const result: TextLayoutCellBase[] = [];

    let lengthToConsume = length;
    while (lengthToConsume > 0) {
      const current = this.cells[this.cursor];
      const bboxTextLength = current.text.length;

      if (lengthToConsume < bboxTextLength) {
        // in this case, split bbox and consume matched part
        // add prefix to the result
        const consumed = current.getPartial([0, lengthToConsume]);
        result.push(consumed);

        const remaining = current.getPartial([lengthToConsume, bboxTextLength]);
        const newCells = [...this.cells];
        newCells[this.cursor] = remaining;
        this.cells = newCells;
        break;
      }

      result.push(current);
      lengthToConsume -= bboxTextLength;
      this.cursor += 1;
    }
    return result;
  }

  /** skip the current cell */
  skip() {
    this.skippedCells.push(this.cells[this.cursor]);
    this.cursor += 1;
  }
}
