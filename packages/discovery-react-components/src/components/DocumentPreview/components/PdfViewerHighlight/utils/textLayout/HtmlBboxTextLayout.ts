import { decodeHTML } from 'entities';
import { ProcessedBbox } from 'utils/document';
import { Bbox, TextSpan } from '../../types';
import { BaseTextLayoutCell } from './BaseTextLayout';
import { HtmlBboxInfo, TextLayout } from './types';

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

  cellAt(id: number) {
    return this.cells[id];
  }

  installStyle() {
    if (this.bboxInfo.styles) {
      // TODO: install style to DOM if not yet. For getBboxForTextSpan in cell
    }
  }
}

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

  getBboxForTextSpan(span: TextSpan, options: { useRatio?: boolean }): Bbox | null {
    if (this.processedBbox != null) {
      // TODO: calculate bbox for text span using text on browser
    }
    return super.getBboxForTextSpan(span, options);
  }
}
