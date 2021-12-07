import { decodeHTML } from 'entities';
import { ProcessedBbox } from 'utils/document';
import { Bbox, TextSpan } from '../../types';
import { BaseTextLayoutCell } from './BaseTextLayout';
import { HtmlBboxInfo, TextLayout } from './types';

/**
 * Text layout based on bboxes in HTML field
 */
export class HtmlBboxTextLayout implements TextLayout<HtmlBboxTextLayoutCell> {
  private readonly bboxInfo: HtmlBboxInfo;
  readonly cells: HtmlBboxTextLayoutCell[];

  constructor(bboxInfo: HtmlBboxInfo, pageNum: number) {
    this.bboxInfo = bboxInfo;
    this.cells =
      bboxInfo.bboxes
        ?.filter(bbox => bbox.page === pageNum)
        .map((bbox, index) => {
          return new HtmlBboxTextLayoutCell(this, index, bbox);
        }) ?? [];
  }

  /**
   * @inheritdoc
   */
  cellAt(id: number) {
    return this.cells[id];
  }

  /**
   * Install style to DOM if not yet. The style will be used to calculate bbox in `getBboxForTextSpan`
   */
  installStyle() {
    if (this.bboxInfo.styles) {
      // TODO: implement this
    }
  }
}

/**
 * Text layout cell based on bboxes in HTML field
 */
class HtmlBboxTextLayoutCell extends BaseTextLayoutCell<HtmlBboxTextLayout> {
  private readonly processedBbox: ProcessedBbox;

  constructor(parent: HtmlBboxTextLayout, index: number, processedBbox: ProcessedBbox) {
    const id = index;
    const pageNum = processedBbox.page;
    const bbox: Bbox = [
      processedBbox.left,
      processedBbox.top,
      processedBbox.right,
      processedBbox.bottom
    ];
    const text = decodeHTML(processedBbox.innerTextSource ?? '');
    super({ parent, id, pageNum, bbox, text });

    this.processedBbox = processedBbox; // keep this for later improvement
  }

  /**
   * @inheritdoc
   */
  getBboxForTextSpan(span: TextSpan, options: { useRatio?: boolean }): Bbox | null {
    if (this.processedBbox != null) {
      // TODO: implement this. calculate bbox for text span using text on browser
    }
    return super.getBboxForTextSpan(span, options);
  }
}
