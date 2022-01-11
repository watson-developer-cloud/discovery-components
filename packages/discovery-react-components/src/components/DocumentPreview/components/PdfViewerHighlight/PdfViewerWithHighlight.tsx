import React, { FC, useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { QueryResult } from 'ibm-watson/discovery/v2';
import useAsyncFunctionCall from 'utils/useAsyncFunctionCall';
import { nonEmpty } from 'utils/nonEmpty';
import { TextMappings } from '../../types';
import { getTextMappings } from '../../utils/documentData';
import { spanIntersects } from '../../utils/textSpan';
import PdfViewer, { PdfViewerProps } from '../PdfViewer/PdfViewer';
import { PdfRenderedText } from '../PdfViewer/PdfViewerTextLayer';
import PdfViewerHighlight from './PdfViewerHighlight';
import { extractDocumentInfo } from './utils/common/documentUtils';
import { DocumentFieldHighlight, HighlightProps } from './types';

type Props = PdfViewerProps & HighlightProps;

/**
 * PDF viewer component with text highlighting capability
 */
const PdfViewerWithHighlight: FC<Props> = ({
  highlightClassName,
  activeHighlightClassName,
  document,
  page,
  highlights,
  activeIds,
  _useHtmlBbox,
  _usePdfTextItem,
  setCurrentPage,
  ...rest
}) => {
  const { scale } = rest;
  const highlightProps: HighlightProps = {
    highlightClassName,
    activeHighlightClassName,
    document,
    highlights,
    activeIds,
    _useHtmlBbox,
    _usePdfTextItem
  };

  const [renderedText, setRenderedText] = useState<PdfRenderedText | null>(null);
  const documentInfo = useAsyncFunctionCall(
    useCallback(async () => await extractDocumentInfo(document), [document])
  );

  const activeHighlightPages = useActiveHighlightPages(document, highlights, activeIds);
  const currentPage = useMovePageToActiveHighlight(page, activeHighlightPages, setCurrentPage);

  const highlightReady = !!documentInfo && !!renderedText;
  return (
    <PdfViewer {...rest} page={currentPage} setRenderedText={setRenderedText}>
      <PdfViewerHighlight
        parsedDocument={highlightReady ? documentInfo ?? null : null}
        pdfRenderedText={highlightReady ? renderedText : null}
        page={currentPage}
        scale={scale}
        {...highlightProps}
      />
    </PdfViewer>
  );
};

/**
 * Hook to move PDF page depending on active highlight
 */
function useMovePageToActiveHighlight(
  page: number,
  activeHighlightPages: (number | null)[],
  setPage: ((page: number) => any) | undefined
) {
  const lastPageRef = useRef(page);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    lastPageRef.current = page;
    setCurrentPage(page);
  }, [page, setCurrentPage]);

  useEffect(() => {
    const pages = activeHighlightPages.filter(nonEmpty);
    if (pages.length === 0 || pages.includes(lastPageRef.current)) {
      return;
    }
    const newPage = pages[0];
    lastPageRef.current = newPage;
    setCurrentPage(newPage);
  }, [activeHighlightPages, setCurrentPage]);

  useEffect(() => {
    if (page !== currentPage && setPage) {
      setPage(currentPage);
    }
  }, [page, currentPage, setPage]);

  return currentPage;
}

/**
 * Hook to calculate pages of active highlights
 */
function useActiveHighlightPages(
  document: QueryResult,
  highlights: DocumentFieldHighlight[],
  activeIds?: string[]
): (number | null)[] {
  const textMappings = useMemo(() => {
    return getTextMappings(document) ?? undefined;
  }, [document]);

  const activePages = useMemo(() => {
    const activePages = (activeIds || []).map(activeId => {
      const hl = highlights.find(hl => hl.id === activeId);
      return hl && textMappings ? getPageFromHighlight(textMappings, hl) : null;
    });
    return activePages;
  }, [textMappings, highlights, activeIds]);

  return activePages;
}

function getPageFromHighlight(textMappings: TextMappings, highlight: DocumentFieldHighlight) {
  const highlightCell = textMappings.text_mappings.find(({ field }) => {
    if (field.name === highlight.field && field.index === highlight.fieldIndex) {
      const { begin, end } = highlight.location;
      return spanIntersects(field.span, [begin, end]);
    }
    return false;
  });
  return highlightCell?.page.page_number ?? null;
}

export default PdfViewerWithHighlight;
