import React, { FC, useMemo, useEffect } from 'react';
import cx from 'classnames';
import { settings } from 'carbon-components';
import { QueryResult } from 'ibm-watson/discovery/v2';
import { ProcessedDoc } from 'utils/document';
import { TextMappings } from '../../types';
import { PdfDisplayProps } from '../PdfViewer/types';
import { PdfRenderedText } from '../PdfViewer/PdfViewerTextLayer';
import { DocumentFieldHighlight } from './types';
import { ExtractedDocumentInfo } from './utils/common/documentUtils';
import { Highlighter } from './utils/Highlighter';

type Props = PdfDisplayProps & {
  /**
   * Class name to style highlight layer
   */
  className?: string;

  /**
   * Class name to style each highlight
   */
  highlightClassName?: string;

  /**
   * Document data returned by query
   */
  document: QueryResult;

  /**
   * Parsed document information
   */
  parsedDocument: ExtractedDocumentInfo | null;

  /**
   * Highlight spans on fields in document
   */
  highlights: DocumentFieldHighlight[];

  /**
   * PDF text content information in a page from parsed PDF
   */
  pdfRenderedText: PdfRenderedText | null;

  /**
   * Flag to whether or not to use bbox information from html field in the document.
   * True by default. This is for testing and debugging purpose.
   */
  _useHtmlBbox?: boolean;

  /**
   * Flag to whether to use PDF text items for finding bbox for highlighting.
   * True by default. This is for testing and debugging purpose.
   */
  _usePdfTextItem?: boolean;
};

/**
 * Text highlight layer for PdfViewer
 */
const PdfViewerHighlight: FC<Props> = ({
  className,
  highlightClassName,
  document,
  parsedDocument,
  page,
  highlights,
  pdfRenderedText,
  scale,
  _useHtmlBbox = true,
  _usePdfTextItem = true
}) => {
  const highlighter = useHighlighter({
    document,
    textMappings: parsedDocument?.textMappings,
    processedDoc: _useHtmlBbox ? parsedDocument?.processedDoc : undefined,
    pdfRenderedText: (_usePdfTextItem && pdfRenderedText) || undefined,
    pageNum: page
  });

  const { textDivs } = pdfRenderedText || {};
  useEffect(() => {
    if (highlighter) {
      highlighter.setTextContentDivs(textDivs);
    }
  }, [highlighter, textDivs]);

  const highlightBoxes = useMemo(() => {
    return highlights.map(highlight => {
      return highlighter?.getHighlight(highlight);
    });
  }, [highlighter, highlights]);

  return (
    <div className={cx(`${settings.prefix}--document-preview-pdf-viewer-highlight`, className)}>
      {highlightBoxes.map((hl, hlIndex) => {
        return (
          <React.Fragment key={`k-${hlIndex}`}>
            {hl?.boxes.map((item, index) => {
              const padding = 0;
              const [left, top, right, bottom] = item.bbox;
              return (
                <div
                  key={`${left}${top}${right}${bottom}_${index}`}
                  className={cx(
                    `${settings.prefix}--document-preview-pdf-viewer-highlight--item`,
                    highlightClassName,
                    hl.className
                  )}
                  style={{
                    left: `${(left - padding) * scale}px`,
                    top: `${(top - padding) * scale}px`,
                    width: `${(right - left + padding) * scale}px`,
                    height: `${(bottom - top + padding) * scale}px`
                  }}
                  data-testid="highlight"
                />
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const useHighlighter = ({
  document,
  textMappings,
  processedDoc,
  pdfRenderedText,
  pageNum
}: {
  document: QueryResult;
  textMappings?: TextMappings;
  processedDoc?: ProcessedDoc;
  pdfRenderedText?: PdfRenderedText;
  pageNum: number;
}) => {
  return useMemo(() => {
    if (textMappings) {
      return new Highlighter({
        document,
        textMappings,
        pageNum,
        htmlBboxInfo: processedDoc && {
          bboxes: processedDoc.bboxes,
          styles: processedDoc.styles
        },
        pdfTextContentInfo:
          pdfRenderedText?.textContent && pdfRenderedText?.viewport ? pdfRenderedText : undefined
      });
    }
    return null;
  }, [document, pageNum, pdfRenderedText, processedDoc, textMappings]);
};

export default PdfViewerHighlight;
