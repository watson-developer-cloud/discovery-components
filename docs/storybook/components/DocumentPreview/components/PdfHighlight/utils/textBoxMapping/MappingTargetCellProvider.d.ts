import { TextLayoutCellBase } from '../textLayout/types';
/**
 * Cell provider with normalization
 * @see CellProvider
 */
export declare class MappingTargetBoxProvider {
    private readonly cellProvider;
    private current;
    constructor(cells: TextLayoutCellBase[]);
    /**
     * check whether this provider has another item to visit or not
     */
    hasNext(): boolean;
    /**
     * get the next value
     */
    getNextInfo(): {
        text: string;
        index: number;
    };
    /**
     * consume (mark as used) first n chars from the cursor
     * @return text layout cells on the consumed text
     */
    consume(length: number): TextLayoutCellBase[];
    /**
     * mark the current cell skipped (when no match found in source)
     */
    skip(): void;
    /**
     * move the cursor to the top to reprocess remaining target cells
     */
    rewind(): void;
}
