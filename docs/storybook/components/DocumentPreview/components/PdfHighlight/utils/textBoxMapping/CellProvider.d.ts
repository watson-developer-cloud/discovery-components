import { TextLayoutCellBase } from '../textLayout/types';
export declare class CellProvider {
    private cells;
    private cursor;
    constructor(cells: TextLayoutCellBase[]);
    hasNext(): boolean;
    /**
     * get cells on a line
     */
    private getNextCells;
    private getNextCellsCache;
    /**
     * get text from cells on a line
     */
    getNextText(): {
        texts: string[];
        nextCellIndex: number;
    };
    /**
     * consume (mark as used) first n chars from the cursor
     * @return text layout cells on the consumed text
     */
    consume(length: number): TextLayoutCellBase[];
    /**
     * skip the current cell
     */
    skip(): void;
    /**
     * move the cursor to the top to reprocess remaining cells
     */
    rewind(): void;
}
