import { TextMappings } from 'components/DocumentPreview/types';
import flatMap from 'lodash/flatMap';
import { PDFPageViewport, TextContent } from 'pdfjs-dist';
import {
  DocumentFields,
  DocumentFieldHighlight,
  HighlightShape,
  HighlightShapeBox
} from '../types';
import { spanOffset, START } from '../../../utils/textSpan';
import { getTextBoxMappings } from './textBoxMapping';
import { TextBoxMapping, TextBoxMappingResult } from './textBoxMapping/types';
import { HtmlBboxTextLayout, PdfTextContentTextLayout, TextMappingsTextLayout } from './textLayout';
import { HtmlBboxInfo, TextLayout, TextLayoutCell } from './textLayout/types';
import { nonEmpty } from './common/nonEmpty';

const debugOut = require('debug')?.('pdf:Highlighter');
function debug(...args: any) {
  debugOut?.apply(null, args);
}

export class Highlighter {
  readonly pageNum: number;
  private readonly textMappingsLayout: TextMappingsTextLayout;
  private pdfTextContentLayout: PdfTextContentTextLayout | null = null;
  private textToHtmlBboxMappings: TextBoxMapping | null = null;
  private textToPdfTextItemMappings: TextBoxMapping | null = null;

  constructor({
    document,
    textMappings,
    pageNum,
    htmlBboxInfo,
    pdfTextContentInfo
  }: {
    document: DocumentFields;
    textMappings: TextMappings;
    pageNum: number;
    htmlBboxInfo?: HtmlBboxInfo;
    pdfTextContentInfo?: {
      textContent: TextContent;
      viewport: PDFPageViewport;
      spans?: HTMLElement[];
    };
  }) {
    this.pageNum = pageNum;
    this.textMappingsLayout = new TextMappingsTextLayout({ document, textMappings }, pageNum);
    if (htmlBboxInfo) {
      this.setHtmlBboxInfo(htmlBboxInfo);
    }
    if (pdfTextContentInfo) {
      this.setTextContentItems(
        pdfTextContentInfo.textContent,
        pdfTextContentInfo.viewport,
        pdfTextContentInfo.spans,
        htmlBboxInfo
      );
    }
  }

  /**
   * Update highlight with bboxes in HTML field in document
   * @param htmlBoxInfo processed document info including bboxes
   */
  setHtmlBboxInfo(htmlBoxInfo: HtmlBboxInfo) {
    const htmlLayout = new HtmlBboxTextLayout(htmlBoxInfo, this.pageNum);
    this.textToHtmlBboxMappings = getTextBoxMappings(this.textMappingsLayout, htmlLayout);
  }

  /**
   * Update highlighter with PDF text content
   * @param textContent PDF text content of the current page
   * @param viewport viewport of the currently rendered PDF page
   * @param textContentDivs HTML elements where text content items are rendered
   * @param htmlBoxInfo processed document info including bboxes
   */
  setTextContentItems(
    textContent: TextContent,
    viewport: PDFPageViewport,
    textContentDivs?: HTMLElement[],
    htmlBoxInfo?: HtmlBboxInfo
  ) {
    this.pdfTextContentLayout = new PdfTextContentTextLayout(
      { textContent, viewport },
      this.pageNum,
      htmlBoxInfo
    );
    this.textToPdfTextItemMappings = getTextBoxMappings(
      this.textMappingsLayout,
      this.pdfTextContentLayout
    );
    this.setTextContentDivs(textContentDivs);
  }

  /**
   * Update text content HTML elements
   * @param textContentDivs HTML elements where text content items are rendered
   */
  setTextContentDivs(textContentDivs?: HTMLElement[]) {
    this.pdfTextContentLayout?.setDivs(textContentDivs);
  }

  /**
   * Get highlight shape from a span on a field
   * @param highlight a span on a document field to highlight
   * @returns highlight shape
   */
  getHighlight<T extends DocumentFieldHighlight = DocumentFieldHighlight>(
    highlight: T
  ): HighlightShape & Omit<T, keyof DocumentFieldHighlight> {
    debug('getHighlight: %o', highlight);
    const { field, fieldIndex, location, className, ...rest } = highlight;
    const items = this.getHighlightTextMappingResult({ field, fieldIndex, location });
    debug('getHighlight - items: %o', items);

    const boxShapes: HighlightShapeBox[] = items
      .map((item, index) => {
        const { cell: baseCell, span: baseSpan } = item.cell?.getNormalized() || {};
        if (baseCell) {
          let bbox = baseCell.bbox;
          if (baseSpan) {
            bbox =
              baseCell.getBboxForTextSpan(baseSpan) ||
              baseCell.getBboxForTextSpan(baseSpan, { useRatio: true }) ||
              baseCell.bbox;
          }
          debug('getHighlight - cell(%i): %o', item.cell);
          debug('                    box: %o', bbox);
          return {
            bbox,
            isStart: index === 0,
            isEnd: index === items.length - 1
          };
        }
        debug('getHighlight - cell(%i) is not mapped. source span: %o', item.sourceSpan);
        return null;
      })
      .filter(nonEmpty);
    return {
      boxes: boxShapes,
      className,
      ...rest
    };
  }

  /**
   * Get text layout cells from a span on a field
   * @param highlight a span on a document field to highlight
   * @returns TextLayoutCells representing the given highlight
   */
  private getHighlightTextMappingResult(highlight: DocumentFieldHighlight): TextBoxMappingResult {
    let items = this.textMappingsLayout.getHighlight(highlight);

    const doMapping = (
      items: TextBoxMappingResult,
      textBoxMapping: TextBoxMapping,
      parent: TextLayout<TextLayoutCell>
    ) =>
      flatMap(items, item => {
        if (item.cell) {
          const { cell: baseCell } = item.cell.getNormalized();
          if (baseCell.parent === parent) {
            const newItems = textBoxMapping.apply(item.cell);
            return newItems.map(({ cell, sourceSpan }) => {
              return {
                cell,
                sourceSpan: spanOffset(sourceSpan, item.sourceSpan[START])
              };
            });
          }
          return item;
        }
        return [];
      });

    const { textToPdfTextItemMappings, textToHtmlBboxMappings } = this;
    if (textToPdfTextItemMappings) {
      items = doMapping(items, textToPdfTextItemMappings, this.textMappingsLayout);
    }
    if (textToHtmlBboxMappings) {
      items = doMapping(items, textToHtmlBboxMappings, this.textMappingsLayout);
    }
    return items;
  }
}
