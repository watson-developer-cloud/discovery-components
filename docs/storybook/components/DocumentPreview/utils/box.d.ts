import { CellPage } from '../types';
import { ProcessedBbox } from '../../../utils/document/processDoc';
/**
 * Check whether two bbox intersect
 * @param boxA first bbox
 * @param boxB second bbox
 * @returns bool
 */
export declare function bboxesIntersect(boxA: number[], boxB: number[]): boolean;
/**
 * find the matching original document bboxes in the processed document bboxes
 * @param docBox bbox from original document
 * @param htmlBox bbox from processed document
 */
export declare const findMatchingBbox: (docBox: CellPage, htmlBox: ProcessedBbox[]) => ProcessedBbox[];
