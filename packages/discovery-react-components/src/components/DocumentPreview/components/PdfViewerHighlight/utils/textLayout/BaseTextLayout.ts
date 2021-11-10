import { Bbox, TextSpan } from '../../types';
import { TextLayout, TextLayoutCell, TextLayoutCellBase } from './types';
import { spanGetText, spanIntersection, spanOffset, START } from '../common/textSpanUtils';
import { bboxGetSpanByRatio } from '../common/bboxUtils';

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

  getPartial(span: TextSpan): TextLayoutCellBase {
    return new PartialTextLayoutCell(this, span);
  }
  getNormalized(): { cell: TextLayoutCell; span?: TextSpan } {
    return { cell: this };
  }
  getBboxForTextSpan(span: TextSpan, options: { useRatio?: boolean }): Bbox | null {
    if (options?.useRatio) {
      return bboxGetSpanByRatio(this.bbox, this.text.length, span);
    }
    return null;
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

  get text() {
    return spanGetText(this.base.text, this.span);
  }

  getPartial(span: TextSpan): TextLayoutCellBase {
    const newSpan = spanIntersection(this.span, spanOffset(span, this.span[START]));
    return new PartialTextLayoutCell(this.base, newSpan);
  }
  getNormalized() {
    return { cell: this.base, span: this.span };
  }
}
