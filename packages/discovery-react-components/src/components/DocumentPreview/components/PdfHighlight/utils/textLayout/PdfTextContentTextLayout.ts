import { bboxesIntersect } from 'components/DocumentPreview/utils/box';
import { TextItem } from 'pdfjs-dist/types/display/api';
import { PageViewport, PageViewportParameters } from 'pdfjs-dist/types/display/display_utils';
import { Bbox, TextSpan } from '../../types';
import { BaseTextLayoutCell } from './BaseTextLayout';
import { getAdjustedCellByOffsetByDom } from './dom';
import { HtmlBboxInfo, PdfTextContentInfo, TextLayout } from './types';

/**
 * Text layout based on PDF text objects
 */
export class PdfTextContentTextLayout implements TextLayout<PdfTextContentTextLayoutCell> {
  private readonly textContentInfo: PdfTextContentInfo;
  readonly cells: PdfTextContentTextLayoutCell[];
  private divs: HTMLElement[] | undefined;

  constructor(textContentInfo: PdfTextContentInfo, pageNum: number, htmlBboxInfo?: HtmlBboxInfo) {
    this.textContentInfo = textContentInfo;

    const textContentItems = textContentInfo.textContent.items as TextItem[];

    this.cells = textContentItems.map((item: TextItem, index: number) => {
      const cellBbox = getBbox(item, this.viewport);
      let isInHtmlBbox = false;
      if (htmlBboxInfo?.bboxes?.length) {
        isInHtmlBbox = htmlBboxInfo.bboxes.some(bbox => {
          return bboxesIntersect(cellBbox, [bbox.left, bbox.top, bbox.right, bbox.bottom]);
        });
      }
      return new PdfTextContentTextLayoutCell(this, index, item, pageNum, cellBbox, isInHtmlBbox);
    });
  }

  /**
   * get viewport of the current page
   */
  get viewport(): PageViewport {
    return this.textContentInfo.viewport;
  }

  /**
   * @inheritdoc
   */
  cellAt(id: number) {
    return this.cells[id];
  }

  /**
   * set PDF text content item divs
   */
  setDivs(divs: HTMLElement[] | undefined) {
    this.divs = divs;
  }

  /**
   * get HTML element for a given cell id
   */
  divAt(id: number): HTMLElement | undefined {
    return this.divs?.[id];
  }
}

/**
 * Text layout cell based on PDF text objects
 */
class PdfTextContentTextLayoutCell extends BaseTextLayoutCell<PdfTextContentTextLayout> {
  /**
   * @inheritdoc
   */
  readonly isInHtmlBbox?: boolean;

  constructor(
    parent: PdfTextContentTextLayout,
    index: number,
    textItem: TextItem,
    pageNum: number,
    bbox: Bbox,
    isInHtmlBbox: boolean
  ) {
    const id = index;
    const text = textItem.str;
    super({ parent, id, pageNum, bbox, text });
    this.isInHtmlBbox = isInHtmlBbox;
  }

  /**
   * @inheritdoc
   */
  getBboxForTextSpan(span: TextSpan, options: { useRatio?: boolean }): Bbox | null {
    const spanElement = this.parent.divAt(this.id);
    if (spanElement && spanElement.parentNode) {
      const scale = this.parent.viewport.scale;
      const bbox = getAdjustedCellByOffsetByDom(this, span, spanElement, scale);
      if (bbox) {
        return bbox;
      }
    }
    return super.getBboxForTextSpan(span, options);
  }
}

/**
 * Get bbox from a PDF text content item
 */
function getBbox(textItem: TextItem, viewport: PageViewport): Bbox {
  const { transform } = textItem;

  const patchedViewport = viewport as PageViewportParameters & PageViewport;
  const defaultSideways = patchedViewport.rotation % 180 !== 0;

  const [fontHeightPx, , offsetX, offsetY, x, y] = transform;
  const [xMin, yMin, , yMax] = patchedViewport.viewBox;
  const top = defaultSideways ? x + offsetX + yMin : yMax - (y + offsetY);
  const left = defaultSideways ? y - xMin : x - xMin;
  const bottom = top + fontHeightPx;
  const adjustHeight = fontHeightPx * 0.2;

  return [left, top + adjustHeight, left + textItem.width, bottom + adjustHeight];
}
