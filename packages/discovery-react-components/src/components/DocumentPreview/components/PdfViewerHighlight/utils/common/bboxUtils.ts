import { intersects } from 'components/DocumentPreview/utils/box';
import { Bbox, TextSpan } from '../../types';
import { spanIntersection, spanLen } from './textSpanUtils';

export const LEFT = 0;
export const TOP = 1;
export const RIGHT = 2;
export const BOTTOM = 3;

/**
 * Check whether two bbox intersect
 *
 * Same to `intersects` in DocumentPreview/utils/box.ts,
 * but for type `Bbox`, which doesn't have page property
 * @param boxA one bbox
 * @param boxB another bbox
 * @returns true iff boxA and boxB are overlapped
 */
export function bboxIntersects(boxA: Bbox, boxB: Bbox): boolean {
  return intersects(boxA, boxB);
}

/**
 * Get bbox for a text span assuming each character takes horizontal spaces evenly
 * @param bbox bbox occupied with a text
 * @param origLength length of the text
 * @returns bbox for the text
 */
export function bboxGetSpanByRatio(bbox: Bbox, origLength: number, span: TextSpan): Bbox {
  const theSpan = spanIntersection([0, origLength], span);
  if (origLength === 0 || spanLen(theSpan) <= 0) {
    return [bbox[0], bbox[1], bbox[0], bbox[3]] as Bbox;
  }

  const [spanStart, spanEnd] = span;
  const [left, top, right, bottom] = bbox;
  const width = right - left;
  const resultLeft = left + (width / origLength) * spanStart;
  const resultRight = left + (width / origLength) * spanEnd;

  return [resultLeft, top, resultRight, bottom];
}

/**
 * Check whether the two bboxes are next to each other in a row.
 * This is used to get a text of a line from a list of small text cells.
 */
export function isNextToEachOther(boxA: Bbox, boxB: Bbox): boolean {
  if (bboxIntersects(boxA, boxB)) {
    return false;
  }

  const [leftA, topA, rightA, bottomA] = boxA;
  const [leftB, topB, rightB, bottomB] = boxB;
  const heightA = bottomA - topA;
  const heightB = bottomB - topB;

  // compare height ratio
  const OVERLAP_RATIO = 0.8;
  if (!(heightA * OVERLAP_RATIO < heightB || heightB * OVERLAP_RATIO < heightA)) {
    return false;
  }

  const avgHeight = (heightA + heightB) / 2;
  const overlapHeight = Math.max(0, Math.min(bottomA, bottomB) - Math.max(topA, topB));
  if (overlapHeight < avgHeight * OVERLAP_RATIO) {
    return false;
  }

  // see if boxes can be neighborhoods
  const verticalGap = Math.max(0, leftB - rightA, leftA - rightB);
  return verticalGap < avgHeight;
}
