import React, { FC, useMemo, useEffect } from 'react';
import cx from 'classnames';
import { settings } from 'carbon-components';
import { QueryResult } from 'ibm-watson/discovery/v2';
import { ProcessedDoc } from 'utils/document';
import { TextMappings } from '../../types';
import { PdfDisplayProps } from '../PdfViewer/types';
import { PdfRenderedText } from '../PdfViewer/PdfViewerTextLayer';
import { ExtractedDocumentInfo } from './utils/common/documentUtils';
import { Highlighter } from './utils/Highlighter';
import { HighlightProps } from './types';

type Props = PdfDisplayProps &
  HighlightProps & {
    /**
     * Class name to style highlight layer
     */
    className?: string;

    /**
     * Parsed document information
     */
    parsedDocument: ExtractedDocumentInfo | null;

    /**
     * PDF text content information in a page from parsed PDF
     */
    pdfRenderedText: PdfRenderedText | null;
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
    pageNum: page,
    isReady: !!(parsedDocument && (!_usePdfTextItem || pdfRenderedText?.page === page))
  });

  const { textDivs } = pdfRenderedText || {};

  const highlightBoxes = useMemo(() => {
    highlighter?.setTextContentDivs(textDivs);
    return highlights.map(highlight => {
      return highlighter?.getHighlight(highlight);
    });
  }, [highlighter, highlights, textDivs]);

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
  pageNum,
  isReady
}: {
  document: QueryResult;
  textMappings?: TextMappings;
  processedDoc?: ProcessedDoc;
  pdfRenderedText?: PdfRenderedText;
  pageNum: number;
  isReady: boolean;
}) => {
  return useMemo(() => {
    if (isReady && textMappings) {
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
  }, [document, isReady, pageNum, pdfRenderedText, processedDoc, textMappings]);
};

export default PdfViewerHighlight;
