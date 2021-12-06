import { TextSpan } from '../types';

export const START = 0;
export const END = 1;

/**
 * Check whether two spans has intersection or not
 * TextSpan version of spansIntersect in utils/document/documentUtil.ts
 */
export function spanIntersects([beginA, endA]: TextSpan, [beginB, endB]: TextSpan): boolean {
  // TODO: integrate with spansIntersect in documentUtils.ts
  // currently, the function returns true to spansIntersect([1,2], [0,1])
  // which is expected to be false here. And fixing it results in test error
  // We need further investigate if we can fix the spansIntersect.
  return beginA < endB && endA > beginB;
}

/**
 * Get text for a given span
 */
export function spanGetText<T extends string | null | undefined>(
  text: T,
  span: TextSpan
): string | T {
  if (!text) return text;
  if (spanLen(span) === 0) return '';
  return text.substring(span[START], span[END]);
}

/**
 * Get span length
 */
export function spanLen(span: TextSpan): number {
  return Math.max(0, span[END] - span[START]);
}

/**
 * Check whether a span includes an given character index or not
 */
export function spanIncludesIndex([begin, end]: TextSpan, index: number): boolean {
  return begin <= index && index < end;
}

/**
 * Check whether a span contains another span
 * (i.e. for all index in `other` span, the index is in `span` span)
 */
export function spanContains(span: TextSpan, other: TextSpan): boolean {
  return span[START] <= other[START] && other[END] <= span[END];
}

/**
 * Get the largest span that is contained by both of given spans
 * @returns intersection of two spans when the two spans intersects. Zero-length span otherwise.
 */
export function spanIntersection(a: TextSpan, b: TextSpan): TextSpan {
  if (spanContains(a, b)) return b;
  if (spanContains(b, a)) return a;
  const start = Math.max(a[START], b[START]);
  const end = Math.min(a[END], b[END]);
  return [start, start <= end ? end : start];
}

/**
 * Get the smallest span that contains both of given spans
 */
export function spanMerge(a: TextSpan, b: TextSpan): TextSpan {
  if (spanContains(a, b) || spanLen(b) === 0) return a;
  if (spanContains(b, a) || spanLen(a) === 0) return b;
  const start = Math.min(a[START], b[START]);
  const end = Math.max(a[END], b[END]);
  return [start, start <= end ? end : start];
}

/**
 * Offset spans by given offset
 */
export function spanOffset([start, end]: TextSpan, offset: number): TextSpan {
  return [start + offset, end + offset];
}

/**
 * Get a span from a `subSpan` on a given `base` span
 *
 * For example, `spanFromSubSpan([10, 20], [1, 2]) // [11, 12]`
 */
export function spanFromSubSpan(base: TextSpan, subSpan: TextSpan): TextSpan {
  return spanIntersection(base, spanOffset(subSpan, base[START]));
}

/**
 * Get a span within a given `base` span for a `span`
 *
 * For example, `spanGetSubSpan([10, 20], [11, 12]) // [1, 2]`
 */
export function spanGetSubSpan(base: TextSpan, span: TextSpan): TextSpan {
  return spanOffset(spanIntersection(base, span), -base[START]);
}

/**
 * Compare method for spans
 *
 * @param spanA a span to compare
 * @param spanB another span to compare
 * @returns a positive number when spanA is after spanB, a negative number when spanA is before spanB, zero when spanA equals to spanB
 */
export function spanCompare([startA, endA]: TextSpan, [startB, endB]: TextSpan): number {
  return startA === startB ? endA - endB : startA - startB;
}
