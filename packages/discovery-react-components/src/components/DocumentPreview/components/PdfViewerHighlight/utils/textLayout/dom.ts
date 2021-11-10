import { getTextNodeAndOffset, uniqRects } from 'utils/document/documentUtils';
import { Bbox, TextSpan } from '../../types';
import { BOTTOM, LEFT, RIGHT, TOP } from '../common/bboxUtils';
import { END, START } from '../common/textSpanUtils';
import { TextLayoutCell } from './types';

const debugOut = require('debug')?.('pdf:textLayout:dom');
function debug(...args: any) {
  debugOut?.apply(null, args);
}

export function getAdjustedCellByOffsetByDom(
  cell: TextLayoutCell,
  textSpan: TextSpan,
  spanElement: HTMLElement,
  scale: number
): Bbox | null {
  if (!(spanElement.firstChild instanceof Text) || !(spanElement.lastChild instanceof Text)) {
    debug('unexpected. span dont have text node');
    return null;
  }

  const beginOffset = textSpan[START];
  const endOffset = Math.min(cell.text.length, textSpan[END]);

  let left = cell.bbox[LEFT];
  let right = cell.bbox[RIGHT];
  const top = cell.bbox[TOP];
  const bottom = cell.bbox[BOTTOM];

  // convert offset
  function getAdjustedOffset(orgOffset: number) {
    return orgOffset;
  }
  try {
    const { textNode: beginTextNode, textOffset: beginTextOffset } =
      beginOffset > 0
        ? getTextNodeAndOffset(spanElement, getAdjustedOffset(beginOffset))
        : { textNode: spanElement.firstChild, textOffset: 0 };
    const { textNode: endTextNode, textOffset: endTextOffset } =
      endOffset > 0
        ? getTextNodeAndOffset(spanElement, getAdjustedOffset(endOffset))
        : { textNode: spanElement.lastChild, textOffset: spanElement.lastChild.length };

    debug('finding text node for: ', cell.text);
    debug('  textContent: ', beginTextNode.textContent);
    debug('  beginOffset: ', beginTextOffset);
    debug('  textContent: ', endTextNode.textContent);
    debug('    endOffset: ', endTextOffset);

    const range = document.createRange();
    range.setStart(beginTextNode, Math.min(beginTextOffset, beginTextNode.length));
    range.setEnd(endTextNode, Math.min(endTextOffset, endTextNode.length));

    // create highlight rect(s) inside of a field
    const parentRect = spanElement.parentElement?.getBoundingClientRect();
    Array.prototype.forEach.call(uniqRects(range.getClientRects() as DOMRectList), rect => {
      left = (rect.left - parentRect!.left) / scale;
      right = left + rect.width / scale;
    });

    return [left, top, right, bottom];
  } catch (e) {
    debug('Caught exception on calculating bbox from DOM: ', e);
  }
  return null;
}
