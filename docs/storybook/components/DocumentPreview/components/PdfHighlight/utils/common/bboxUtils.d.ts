import { Bbox, TextSpan } from '../../types';
/**
 * Get bbox for a text span assuming each character takes horizontal spaces evenly
 * @param bbox bbox occupied with a text
 * @param origLength length of the text
 * @returns bbox for the text
 */
export declare function bboxGetSpanByRatio(bbox: Bbox, origLength: number, span: TextSpan): Bbox;
/**
 * Check whether the two bboxes are next to each other in a row.
 * This is used to get a text of a line from a list of small text cells.
 */
export declare function isNextToEachOther(boxA: Bbox, boxB: Bbox): boolean;
