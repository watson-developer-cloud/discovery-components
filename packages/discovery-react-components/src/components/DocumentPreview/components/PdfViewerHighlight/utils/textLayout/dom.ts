import { forEachRectInRange, getTextNodeAndOffset } from 'utils/document/documentUtils';
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

  try {
    const { textNode: beginTextNode, textOffset: beginTextOffset } =
      beginOffset > 0
        ? getTextNodeAndOffset(spanElement, beginOffset)
        : { textNode: spanElement.firstChild, textOffset: 0 };
    const { textNode: endTextNode, textOffset: endTextOffset } =
      endOffset > 0
        ? getTextNodeAndOffset(spanElement, endOffset)
        : { textNode: spanElement.lastChild, textOffset: spanElement.lastChild.length };

    debug('finding text node for: ', cell.text);
    debug('  textContent: ', beginTextNode.textContent);
    debug('  beginOffset: ', beginTextOffset);
    debug('  textContent: ', endTextNode.textContent);
    debug('    endOffset: ', endTextOffset);

    // create highlight rect(s) inside of a field
    let left = cell.bbox[LEFT];
    let right = cell.bbox[RIGHT];
    const top = cell.bbox[TOP];
    const bottom = cell.bbox[BOTTOM];

    const parentRect = spanElement.parentElement?.getBoundingClientRect();
    forEachRectInRange(beginTextNode, beginTextOffset, endTextNode, endTextOffset, rect => {
      left = (rect.left - parentRect!.left) / scale;
      right = left + rect.width / scale;
    });

    return [left, top, right, bottom];
  } catch (e) {
    debug('Caught exception on calculating bbox from DOM: ', e);
  }
  return null;
}
