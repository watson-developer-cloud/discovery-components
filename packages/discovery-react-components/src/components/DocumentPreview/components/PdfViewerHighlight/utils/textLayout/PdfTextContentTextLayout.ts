import { PDFPageViewport, PDFPageViewportOptions, TextContentItem } from 'pdfjs-dist';
import { Bbox, TextSpan } from '../../types';
import { bboxIntersects } from '../common/bboxUtils';
import { BaseTextLayoutCell } from './BaseTextLayout';
import { getAdjustedCellByOffsetByDom } from './dom';
import { HtmlBboxInfo, PdfTextContentInfo, TextLayout } from './types';

export class PdfTextContentTextLayout implements TextLayout<PdfTextContentTextLayoutCell> {
  private readonly textContentInfo: PdfTextContentInfo;
  readonly cells: PdfTextContentTextLayoutCell[];
  private spans: HTMLElement[] | undefined;

  constructor(textContentInfo: PdfTextContentInfo, pageNum: number, htmlBboxInfo?: HtmlBboxInfo) {
    this.textContentInfo = textContentInfo;

    const textContentItems = textContentInfo.textContent.items;

    this.cells = textContentItems
      .map((item, index) => {
        return new PdfTextContentTextLayoutCell(this, index, item, pageNum);
      })
      .filter(cell => {
        if (htmlBboxInfo?.bboxes?.length) {
          return htmlBboxInfo.bboxes.some(bbox => {
            return bboxIntersects(cell.bbox, [bbox.left, bbox.top, bbox.right, bbox.bottom]);
          });
        }
        return true;
      });
  }

  get viewport() {
    return this.textContentInfo.viewport;
  }

  cellAt(id: number) {
    return this.cells[id];
  }

  setSpans(spans: HTMLElement[] | undefined) {
    this.spans = spans;
  }
  spanAt(id: number) {
    return this.spans?.[id];
  }
}

class PdfTextContentTextLayoutCell extends BaseTextLayoutCell<PdfTextContentTextLayout> {
  // private readonly textItem: TextContentItem;

  constructor(
    parent: PdfTextContentTextLayout,
    index: number,
    textItem: TextContentItem,
    pageNum: number
  ) {
    const id = index;
    const bbox = PdfTextContentTextLayoutCell.getBbox(textItem, parent.viewport);
    const text = textItem.str;
    super({ parent, id, pageNum, bbox, text });

    // this.textItem = textItem;
  }

  getBboxForTextSpan(span: TextSpan, options: { useRatio?: boolean }): Bbox | null {
    const spanElement = this.parent.spanAt(this.id);
    if (spanElement && spanElement.parentNode) {
      const scale = this.parent.viewport.scale;
      const bbox = getAdjustedCellByOffsetByDom(this, span, spanElement, scale);
      if (bbox) {
        return bbox;
      }
    }
    return super.getBboxForTextSpan(span, options);
  }

  static getBbox(textItem: TextContentItem, viewport: PDFPageViewport): Bbox {
    const { transform } = textItem;

    const patchedViewport = viewport as PDFPageViewportOptions & PDFPageViewport;
    const defaultSideways = patchedViewport.rotation % 180 !== 0;

    // not sure this is true...
    const [fontHeightPx, , offsetX, offsetY, x, y] = transform;

    const [xMin, yMin, , yMax] = patchedViewport.viewBox;
    const top = defaultSideways ? x + offsetX + yMin : yMax - (y + offsetY);
    const left = defaultSideways ? y - xMin : x - xMin;
    const bottom = top + fontHeightPx;
    const adjustHeight = fontHeightPx * 0.2;

    return [left, top + adjustHeight, left + textItem.width, bottom + adjustHeight];
  }
}
