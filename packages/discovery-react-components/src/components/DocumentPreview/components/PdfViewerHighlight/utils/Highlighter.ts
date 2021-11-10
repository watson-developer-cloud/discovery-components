import { TextMappings } from 'components/DocumentPreview/types';
import flatMap from 'lodash/flatMap';
import { PDFPageViewport, TextContent } from 'pdfjs-dist';
import {
  DocumentFields,
  DocumentFieldHighlight,
  HighlightShape,
  HighlightShapeBox
} from '../types';
import { getTextBoxMappings } from './textBoxMapping';
import { TextBoxMapping, TextBoxMappingResult } from './textBoxMapping/types';
import { HtmlBboxTextLayout, PdfTextContentTextLayout, TextMappingsTextLayout } from './textLayout';
import { HtmlBboxInfo } from './textLayout/types';
import { spanOffset, START } from './common/textSpanUtils';
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
      this.setProcessedDoc(htmlBboxInfo);
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

  setProcessedDoc(htmlBoxInfo: HtmlBboxInfo) {
    const htmlLayout = new HtmlBboxTextLayout(htmlBoxInfo, this.pageNum);
    this.textToHtmlBboxMappings = getTextBoxMappings(this.textMappingsLayout, htmlLayout);
  }

  setTextContentItems(
    textContent: TextContent,
    viewport: PDFPageViewport,
    spans?: HTMLElement[],
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
    this.setTextContentDivs(spans);
  }

  setTextContentDivs(spans?: HTMLElement[]) {
    this.pdfTextContentLayout?.setSpans(spans);
  }

  getHighlightTextMappingResult(highlight: DocumentFieldHighlight): TextBoxMappingResult {
    let items = this.textMappingsLayout.getHighlight(highlight);

    const doMapping = (items: TextBoxMappingResult, textBoxMapping: TextBoxMapping, parent: any) =>
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
        } else {
          debug('getHighlight - cell(%i) missing. source span: %o', item.sourceSpan);
        }
        // drop something!!
        return null;
      })
      .filter(nonEmpty);
    return {
      boxes: boxShapes,
      className,
      ...rest
    };
  }
}
