import { Bbox, TextSpan } from '../../types';
import { spanIntersection, spanLen } from '../../../../utils/textSpan';

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
  //
  // The ratio of height used to check whether two bboxes are on the same line or not.
  // With the value 0.8, when more than 80% of range of height of each bbox overlaps
  // one of another, they are considered on the same line.
  //
  const OVERLAP_RATIO = 0.8;

  const [leftA, topA, rightA, bottomA] = boxA;
  const [leftB, topB, rightB, bottomB] = boxB;
  const heightA = bottomA - topA;
  const heightB = bottomB - topB;

  // compare height ratio
  if (!(heightA * OVERLAP_RATIO < heightB || heightB * OVERLAP_RATIO < heightA)) {
    return false;
  }

  const avgHeight = (heightA + heightB) / 2;
  const overlapHeight = Math.max(0, Math.min(bottomA, bottomB) - Math.max(topA, topB));
  if (overlapHeight < avgHeight * OVERLAP_RATIO) {
    return false;
  }

  // see if boxes can be neighborhoods
  const horizontalGap = Math.max(leftB - rightA, leftA - rightB);
  if (horizontalGap < 0) {
    // gap < 0 means that the boxes are overlapped
    const overlap = -horizontalGap;
    // consider two horizontally aligned overlapped boxes are next to each other when
    // the overlap is smaller than half of the box height.
    return overlap < avgHeight / 2;
  }

  return horizontalGap < avgHeight;
}
