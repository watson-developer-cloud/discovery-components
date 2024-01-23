import { Bbox, TextSpan } from '../../types';
import { TextLayoutCell } from './types';
/**
 * Get a bbox for a span on a text layout cell using DOM element rendered on browser
 * @param cell text layout cell
 * @param textSpan span on the text layout cell
 * @param spanElement an DOM element where the text layout cell is rendered
 * @param scale the current scale factor
 * @returns bbox for the span on the cell
 */
export declare function getAdjustedCellByOffsetByDom(cell: TextLayoutCell, textSpan: TextSpan, spanElement: HTMLElement, scale: number): Bbox | null;
