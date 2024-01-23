import { TextSpan } from '../types';
export declare const START = 0;
export declare const END = 1;
/**
 * Check whether two spans has intersection or not
 * TextSpan version of spansIntersect in utils/document/documentUtil.ts
 */
export declare function spanIntersects([beginA, endA]: TextSpan, [beginB, endB]: TextSpan): boolean;
/**
 * Get text for a given span
 */
export declare function spanGetText<T extends string | null | undefined>(text: T, span: TextSpan): string | T;
/**
 * Get span length
 */
export declare function spanLen(span: TextSpan): number;
/**
 * Check whether a span includes an given character index or not
 */
export declare function spanIncludesIndex([begin, end]: TextSpan, index: number): boolean;
/**
 * Check whether a span contains another span
 * (i.e. for all index in `other` span, the index is in `span` span)
 */
export declare function spanContains(span: TextSpan, other: TextSpan): boolean;
/**
 * Get the largest span that is contained by both of given spans
 * @returns intersection of two spans when the two spans intersects. Zero-length span otherwise.
 */
export declare function spanIntersection(a: TextSpan, b: TextSpan): TextSpan;
/**
 * Get the smallest span that contains both of given spans
 */
export declare function spanMerge(a: TextSpan, b: TextSpan): TextSpan;
/**
 * Offset spans by given offset
 */
export declare function spanOffset([start, end]: TextSpan, offset: number): TextSpan;
/**
 * Get a span from a `subSpan` on a given `base` span
 *
 * For example, `spanFromSubSpan([10, 20], [1, 2]) // [11, 12]`
 */
export declare function spanFromSubSpan(base: TextSpan, subSpan: TextSpan): TextSpan;
/**
 * Get a span within a given `base` span for a `span`
 *
 * For example, `spanGetSubSpan([10, 20], [11, 12]) // [1, 2]`
 */
export declare function spanGetSubSpan(base: TextSpan, span: TextSpan): TextSpan;
/**
 * Compare method for spans
 *
 * @param spanA a span to compare
 * @param spanB another span to compare
 * @returns a positive number when spanA is after spanB, a negative number when spanA is before spanB, zero when spanA equals to spanB
 */
export declare function spanCompare([startA, endA]: TextSpan, [startB, endB]: TextSpan): number;
