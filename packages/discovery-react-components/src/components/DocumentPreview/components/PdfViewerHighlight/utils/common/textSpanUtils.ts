import { TextSpan } from '../../types';

export const START = 0;
export const END = 1;

export function spanGetText<T extends string | null | undefined>(text: T, span: TextSpan) {
  if (!text) return text;
  if (spanLen(span) === 0) return '';
  return text.substring(span[START], span[END]);
}

export function spanLen(span: TextSpan) {
  return Math.max(0, span[END] - span[START]);
}

export function spanIntersects([beginA, endA]: TextSpan, [beginB, endB]: TextSpan): boolean {
  return beginA < endB && endA > beginB;
}

export function spanIncludesIndex([begin, end]: TextSpan, index: number) {
  return begin <= index && index < end;
}

export function spanContains(span: TextSpan, other: TextSpan) {
  return span[START] <= other[START] && other[END] <= span[END];
}

export function spanIntersection(a: TextSpan, b: TextSpan): TextSpan {
  if (spanContains(a, b)) return b;
  if (spanContains(b, a)) return a;
  const start = Math.max(a[START], b[START]);
  const end = Math.min(a[END], b[END]);
  return [start, start <= end ? end : start];
}

export function spanUnion(a: TextSpan, b: TextSpan): TextSpan {
  if (spanContains(a, b) || spanLen(b) === 0) return a;
  if (spanContains(b, a) || spanLen(a) === 0) return b;
  const start = Math.min(a[START], b[START]);
  const end = Math.max(a[END], b[END]);
  return [start, start <= end ? end : start];
}

export function spanOffset([start, end]: TextSpan, offset: number): TextSpan {
  return [start + offset, end + offset];
}

export function spanFromSubSpan(base: TextSpan, subSpan: TextSpan) {
  return spanIntersection(base, spanOffset(subSpan, base[START]));
}

export function spanGetSubSpan(base: TextSpan, span: TextSpan) {
  return spanOffset(spanIntersection(base, span), -base[START]);
}

export function spanCompare([startA, endA]: TextSpan, [startB, endB]: TextSpan) {
  return startA === startB ? endA - endB : startA - startB;
}
