import { CellPage } from '../types';
import { ProcessedBbox } from '../../../utils/document/processDoc';

/**
 * Check whether two bbox intersect
 * @param boxA first bbox
 * @param boxB second bbox
 * @returns bool
 */
function intersects(boxA: number[], boxB: number[]): boolean {
  const [leftA, topA, rightA, bottomA, pageA] = boxA;
  const [leftB, topB, rightB, bottomB, pageB] = boxB;
  return !(leftB > rightA || rightB < leftA || topB > bottomA || bottomB < topA || pageA != pageB);
}

/**
 * find the matching original document bboxs in the processed document bboxs
 * @param cellBox bbox from original document
 * @param processBox bbox from processed document
 */
export const findMatchingBbox = (cellBox: CellPage, processBox: ProcessedBbox[]) => {
  return processBox.filter(pBbox => {
    const { left, top, right, bottom, page } = pBbox;
    const [left2, top2, right2, bottom2] = cellBox.bbox;
    return intersects(
      [left2, top2, right2, bottom2, cellBox.page_number],
      [left, top, right, bottom, page]
    );
  });
};
