import { CellPage } from '../types';
import { ProcessedBbox } from '../../../utils/document/processDoc';

/**
 * Check whether two bbox intersect
 * @param boxA first bbox
 * @param boxB second bbox
 * @returns bool
 */
export function bboxesIntersect(boxA: number[], boxB: number[]): boolean {
  const [leftA, topA, rightA, bottomA, pageA] = boxA;
  const [leftB, topB, rightB, bottomB, pageB] = boxB;
  return !(
    leftB >= rightA ||
    rightB <= leftA ||
    topB >= bottomA ||
    bottomB <= topA ||
    pageA !== pageB
  );
}

/**
 * find the matching original document bboxes in the processed document bboxes
 * @param docBox bbox from original document
 * @param htmlBox bbox from processed document
 */
export const findMatchingBbox = (docBox: CellPage, htmlBox: ProcessedBbox[]) => {
  return htmlBox.filter(pBbox => {
    const { left, top, right, bottom, page } = pBbox;
    const [left2, top2, right2, bottom2] = docBox.bbox;
    return bboxesIntersect(
      [left2, top2, right2, bottom2, docBox.page_number],
      [left, top, right, bottom, page]
    );
  });
};
