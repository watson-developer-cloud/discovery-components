import { forEachRectInRange, getTextNodeAndOffset } from 'utils/document/documentUtils';
import { Bbox, TextSpan } from '../../types';
import { END, START } from '../../../../utils/textSpan';
import { TextLayoutCell } from './types';

const debugOut = require('debug')?.('pdf:textLayout:dom');
function debug(...args: any) {
  debugOut?.apply(null, args);
}

/**
 * Get a bbox for a span on a text layout cell using DOM element rendered on browser
 * @param cell text layout cell
 * @param textSpan span on the text layout cell
 * @param spanElement an DOM element where the text layout cell is rendered
 * @param scale the current scale factor
 * @returns bbox for the span on the cell
 */
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
    let [left, top, right, bottom] = cell.bbox;

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
