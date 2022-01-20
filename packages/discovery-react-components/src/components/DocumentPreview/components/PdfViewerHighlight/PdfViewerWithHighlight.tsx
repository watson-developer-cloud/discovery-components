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
  activeHighlightPages: number[],
  setPage: ((page: number) => any) | undefined
) {
  const [currentPage, setCurrentPage] = useState(page);

  // update current page when the 'page' is changed (i.e. user changes the page)
  const previousPageRef = useRef(page);
  useEffect(() => {
    if (previousPageRef.current !== page && currentPage !== page) {
      setCurrentPage(page);
    }
    previousPageRef.current = page;
  }, [page]);

  // update the current page and invoke setPage when the page is changed by activating a highlight
  const previousHighlightPageRef = useRef<number | undefined>();
  useEffect(() => {
    const highlightPage = activeHighlightPages[0];
    if (highlightPage == null || activeHighlightPages.includes(currentPage)) {
      // do nothing when no highlight or the active highlight is on the current page
      return;
    }

    if (previousHighlightPageRef.current !== highlightPage) {
      previousHighlightPageRef.current = highlightPage;
      if (highlightPage != null) {
        setCurrentPage(highlightPage);
        setPage?.(highlightPage);
      }
    }
  }, [activeHighlightPages, currentPage, setPage]);

  return currentPage;
}

/**
 * Hook to calculate pages of active highlights
 */
function useActiveHighlightPages(
  document: QueryResult,
  highlights: DocumentFieldHighlight[],
  activeIds?: string[]
): number[] {
  const textMappings = useMemo(() => {
    return getTextMappings(document) ?? undefined;
  }, [document]);

  const activePages = useMemo(() => {
    const activePages = (activeIds || []).map(activeId => {
      const hl = highlights.find(hl => hl.id === activeId);
      return hl && textMappings ? getPageFromHighlight(textMappings, hl) : null;
    });
    return activePages.filter(nonEmpty);
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
