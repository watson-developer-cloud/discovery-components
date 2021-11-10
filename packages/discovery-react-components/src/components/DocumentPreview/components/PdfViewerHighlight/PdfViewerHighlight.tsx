import React, { FC, useMemo, useEffect } from 'react';
import cx from 'classnames';
import { DocumentFieldHighlight } from './types';
import { QueryResult } from 'ibm-watson/discovery/v2';
import { PdfTextLayerInfo } from '../PdfViewer/PdfViewerTextLayer';
import { Highlighter } from './utils/Highlighter';
import { ExtractedDocumentInfo } from './utils/common/documentUtils';
import { settings } from 'carbon-components';

interface Props {
  className?: string;
  highlightClassName?: string;

  document: QueryResult;
  documentInfo: ExtractedDocumentInfo | null;
  pageNum: number;
  highlights: DocumentFieldHighlight[];
  pdfTextLayerInfo?: PdfTextLayerInfo;

  scale?: number;

  useHtmlBbox?: boolean;
  usePdfTextItem?: boolean;
}

const PdfViewerHighlight: FC<Props> = ({
  className,
  highlightClassName,
  document,
  documentInfo,
  pageNum,
  highlights,
  pdfTextLayerInfo,
  scale = 1.0,
  useHtmlBbox = true,
  usePdfTextItem = true
}) => {
  const {
    viewport: pdfViewport,
    textContent: pdfTextContent,
    textDivs: pdfTextDivs
  } = pdfTextLayerInfo || {};
  const highlighter = useMemo(() => {
    if (documentInfo && documentInfo.textMappings) {
      return new Highlighter({
        document,
        textMappings: documentInfo.textMappings,
        pageNum,
        htmlBboxInfo: useHtmlBbox
          ? {
              bboxes: documentInfo.processedDoc.bboxes,
              styles: documentInfo.processedDoc.styles
            }
          : undefined,
        pdfTextContentInfo:
          usePdfTextItem && pdfTextContent && pdfViewport
            ? { textContent: pdfTextContent, viewport: pdfViewport }
            : undefined
      });
    }
    return null;
  }, [document, documentInfo, pageNum, pdfTextContent, pdfViewport, useHtmlBbox, usePdfTextItem]);

  useEffect(() => {
    if (highlighter) {
      highlighter.setTextContentDivs(pdfTextDivs);
    }
  }, [highlighter, pdfTextDivs]);

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

export default PdfViewerHighlight;
