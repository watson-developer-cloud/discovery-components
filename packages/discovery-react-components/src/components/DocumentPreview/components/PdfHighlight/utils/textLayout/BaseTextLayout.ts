import { spanGetText, spanIntersection, spanOffset, START } from '../../../../utils/textSpan';
import { Bbox, TextSpan } from '../../types';
import { bboxGetSpanByRatio } from '../common/bboxUtils';
import { TextLayout, TextLayoutCell, TextLayoutCellBase } from './types';

/**
 * Base implementation of text layout cell
 */
export class BaseTextLayoutCell<Layout extends TextLayout<TextLayoutCell>>
  implements TextLayoutCell
{
  readonly parent: Layout;
  readonly id: number;
  readonly pageNum: number;
  readonly bbox: Bbox;
  readonly text: string;

  constructor({
    parent,
    id,
    pageNum,
    bbox,
    text
  }: {
    parent: Layout;
    id: number;
    pageNum: number;
    bbox: Bbox;
    text: string;
  }) {
    this.parent = parent;
    this.id = id;
    this.pageNum = pageNum;
    this.bbox = bbox;
    this.text = text;
  }

  /**
   * @inheritdoc
   */
  getPartial(span: TextSpan): TextLayoutCellBase {
    return new PartialTextLayoutCell(this, span);
  }

  /**
   * @inheritdoc
   */
  getNormalized(): { cell: TextLayoutCell; span?: TextSpan } {
    return { cell: this };
  }

  /**
   * @inheritdoc
   */
  getBboxForTextSpan(span: TextSpan, options: { useRatio?: boolean }): Bbox | null {
    if (options?.useRatio) {
      return bboxGetSpanByRatio(this.bbox, this.text.length, span);
    }
    return null;
  }

  /**
   * @inheritdoc
   */
  trim(): TextLayoutCellBase {
    return trimCell(this);
  }
}

/**
 * Text span on a base text layout cell
 */
export class PartialTextLayoutCell implements TextLayoutCellBase {
  readonly base: TextLayoutCell;
  readonly span: TextSpan;

  constructor(base: TextLayoutCell, span: TextSpan) {
    this.base = base;
    this.span = spanIntersection([0, base.text.length], span);
  }

  /* @inheritdoc */
  get text() {
    return spanGetText(this.base.text, this.span);
  }

  /**
   * @inheritdoc
   */
  getPartial(span: TextSpan): TextLayoutCellBase {
    const newSpan = spanIntersection(this.span, spanOffset(span, this.span[START]));
    return new PartialTextLayoutCell(this.base, newSpan);
  }

  /**
   * @inheritdoc
   */
  getNormalized() {
    return { cell: this.base, span: this.span };
  }

  /**
   * @inheritdoc
   */
  trim(): TextLayoutCellBase {
    return trimCell(this);
  }
}

/**
 * Get a text layout cell that represents a trimmed text of a given `cell`
 * @returns a new cell for the trimmed text. Zero-length cell when the text of the given `cell` is blank
 */
function trimCell(cell: TextLayoutCellBase) {
  const text = cell.text;
  const nLeadingSpaces = text.match(/^\s*/)![0].length;
  const nTrailingSpaces = text.match(/\s*$/)![0].length;
  if (nLeadingSpaces === 0 && nTrailingSpaces === 0) {
    return cell;
  }
  if (text.length > nLeadingSpaces + nTrailingSpaces) {
    return cell.getPartial([nLeadingSpaces, text.length - nTrailingSpaces]);
  }
  return cell.getPartial([0, 0]); // return zero-length cell
}
