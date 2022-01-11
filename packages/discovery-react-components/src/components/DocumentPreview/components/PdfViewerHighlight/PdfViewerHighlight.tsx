import React, { FC, useMemo, useEffect, useRef } from 'react';
import cx from 'classnames';
import { settings } from 'carbon-components';
import { QueryResult } from 'ibm-watson/discovery/v2';
import { ProcessedDoc } from 'utils/document';
import { Bbox, TextMappings } from '../../types';
import { PdfDisplayProps } from '../PdfViewer/types';
import { PdfRenderedText } from '../PdfViewer/PdfViewerTextLayer';
import { ExtractedDocumentInfo } from './utils/common/documentUtils';
import { Highlighter } from './utils/Highlighter';
import { HighlightProps, HighlightShape } from './types';

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
  activeHighlightClassName,
  document,
  parsedDocument,
  page,
  highlights,
  activeIds,
  scrollIntoActiveHighlight,
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

  const highlightShapes = useMemo(() => {
    highlighter?.setTextContentDivs(textDivs);
    return highlights.map(highlight => {
      return highlighter?.getHighlight(highlight);
    });
  }, [highlighter, highlights, textDivs]);

  const highlightDivRef = useRef<HTMLDivElement | null>(null);
  useScrollIntoActiveHighlight(
    highlightDivRef,
    highlightShapes,
    activeIds,
    scrollIntoActiveHighlight
  );

  return (
    <div
      ref={highlightDivRef}
      className={cx(`${settings.prefix}--document-preview-pdf-viewer-highlight`, className)}
    >
      {highlightShapes.map((shape, hlIndex) => {
        const active = shape?.highlightId ? activeIds?.includes(shape.highlightId) : false;
        return (
          <Highlight
            className={highlightClassName}
            activeClassName={activeHighlightClassName}
            shape={shape}
            index={hlIndex}
            scale={scale}
            active={active}
          />
        );
      })}
    </div>
  );
};

const Highlight: FC<{
  className?: string;
  activeClassName?: string;
  shape?: HighlightShape;
  index: number;
  scale: number;
  active?: boolean;
}> = ({ className, activeClassName, shape, index, scale, active }) => {
  function getPositionStyle(bbox: Bbox, scale: number, padding: number = 0) {
    const [left, top, right, bottom] = bbox;
    return {
      left: `${(left - padding) * scale}px`,
      top: `${(top - padding) * scale}px`,
      width: `${(right - left + padding) * scale}px`,
      height: `${(bottom - top + padding) * scale}px`
    };
  }

  const highlightId = shape?.highlightId ?? `hl-${index}`;
  return (
    <div key={highlightId} data-highlightId={highlightId}>
      {shape?.boxes.map((item, index) => {
        return (
          <div
            key={`hlId_${index}`}
            className={cx(
              `${settings.prefix}--document-preview-pdf-viewer-highlight--item`,
              className,
              shape.className,
              active && `${settings.prefix}--document-preview-pdf-viewer-highlight--item--active`,
              active && activeClassName
            )}
            style={{ ...getPositionStyle(item.bbox, scale) }}
          />
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

function useScrollIntoActiveHighlight(
  highlightDivRef: React.MutableRefObject<HTMLDivElement | null>,
  shapes: (HighlightShape | undefined)[],
  activeIds: string[] | undefined,
  scrollIntoActiveId: boolean | undefined
) {
  useEffect(() => {
    if (!scrollIntoActiveId || !highlightDivRef.current) {
      return;
    }

    const activeShape = shapes.find(
      shape => shape?.highlightId && activeIds?.includes(shape.highlightId)
    );
    if (activeShape) {
      const timer = setTimeout(() => {
        const highlightDiv = highlightDivRef.current;
        if (!highlightDiv) return;

        const highlightElm = highlightDiv?.querySelector(
          `[data-highlightId=${activeShape.highlightId}]`
        );
        highlightElm?.firstElementChild?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }, 50);
      return () => clearTimeout(timer);
    }
    return;
  }, [activeIds, highlightDivRef, shapes, scrollIntoActiveId]);
}

export default PdfViewerHighlight;
