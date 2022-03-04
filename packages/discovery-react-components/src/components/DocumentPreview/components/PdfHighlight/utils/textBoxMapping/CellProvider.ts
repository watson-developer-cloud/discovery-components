import { isNextToEachOther } from '../common/bboxUtils';
import { TextLayoutCell, TextLayoutCellBase } from '../textLayout/types';

export class CellProvider {
  private cells: readonly TextLayoutCellBase[];
  private cursor: number = 0;

  constructor(cells: TextLayoutCellBase[]) {
    this.cells = Object.freeze([...cells]);
  }

  hasNext(): boolean {
    while (this.cursor < this.cells.length) {
      const cell = this.cells[this.cursor];
      if (cell.text.trim().length !== 0) {
        break;
      }
      this.skip();
    }
    return this.cursor < this.cells.length;
  }

  /**
   * get cells on a line
   */
  private getNextCells(): TextLayoutCellBase[] {
    const {
      cells: lastCells,
      cursor: lastCursor,
      result: lastResult
    } = this.getNextCellsCache || {};

    if (lastResult && lastCells === this.cells && lastCursor === this.cursor) {
      return lastResult;
    }

    const result: TextLayoutCellBase[] = [];
    let lastCell: TextLayoutCell | null = null;
    for (let i = this.cursor; i < this.cells.length; i += 1) {
      const currentBox = this.cells[i];
      // maybe we need to break this loop by big box change
      const { cell: baseCurrentCell } = currentBox.getNormalized();
      if (lastCell && !isNextToEachOther(lastCell.bbox, baseCurrentCell.bbox)) {
        break;
      }
      result.push(currentBox);
      lastCell = baseCurrentCell;
    }

    this.getNextCellsCache = {
      cells: this.cells,
      cursor: this.cursor,
      result
    };
    return result;
  }

  private getNextCellsCache: {
    cells: readonly TextLayoutCellBase[];
    cursor: number;
    result: TextLayoutCellBase[];
  } | null = null;

  /**
   * get text from cells on a line
   */
  getNextText(): { texts: string[]; nextCellIndex: number } {
    const nextCells = this.getNextCells();
    const texts = nextCells.map(cell => cell.text);
    return { texts, nextCellIndex: this.cursor };
  }

  /**
   * consume (mark as used) first n chars from the cursor
   * @return text layout cells on the consumed text
   */
  consume(length: number): TextLayoutCellBase[] {
    const result: TextLayoutCellBase[] = [];
    if (length <= 0) {
      return result;
    }

    let lengthToConsume = length;
    const newCells = [...this.cells];
    while (lengthToConsume > 0 && this.cursor < this.cells.length) {
      const current = this.cells[this.cursor];
      const bboxTextLength = current.text.length;

      if (lengthToConsume < bboxTextLength) {
        // in this case, split bbox and consume matched part
        // add prefix to the result
        const consumed = current.getPartial([0, lengthToConsume]);
        result.push(consumed);

        const remaining = current.getPartial([lengthToConsume, bboxTextLength]);
        newCells[this.cursor] = remaining;
        break;
      }

      result.push(current);
      newCells[this.cursor] = current.getPartial([0, 0]);
      lengthToConsume -= bboxTextLength;
      this.cursor += 1;
    }

    this.cells = Object.freeze(newCells);
    return result;
  }

  /**
   * skip the current cell
   */
  skip() {
    this.cursor += 1;
  }

  /**
   * move the cursor to the top to reprocess remaining cells
   */
  rewind() {
    this.cursor = 0;
    this.getNextCellsCache = null;
  }
}
