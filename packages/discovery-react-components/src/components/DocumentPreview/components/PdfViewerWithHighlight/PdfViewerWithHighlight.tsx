import React, { FC, useState, useCallback, useEffect, useRef } from 'react';
import { QueryResultPassage, QueryTableResult } from 'ibm-watson/discovery/v2';
import useAsyncFunctionCall from 'utils/useAsyncFunctionCall';
import { nonEmpty } from 'utils/nonEmpty';
import { TextMappings } from '../../types';
import { spanIntersects } from '../../utils/textSpan';
import { isPassage } from '../Highlight/passages';
import { getHighlightTable, isTable } from '../Highlight/tables';
import PdfViewer, { PdfViewerProps } from '../PdfViewer/PdfViewer';
import { PdfRenderedText } from '../PdfViewer/PdfViewerTextLayer';
import PdfHighlight from '../PdfHighlight/PdfHighlight';
import {
  DocumentBboxHighlight,
  DocumentFieldHighlight,
  HighlightProps
} from '../PdfHighlight/types';
import {
  extractDocumentInfo,
  ExtractedDocumentInfo
} from '../PdfHighlight/utils/common/documentUtils';
import {
  convertToDocumentFieldHighlights,
  convertToDocumentBboxHighlights,
  DEFAULT_HIGHLIGHT_ID
} from '../PdfHighlight/utils/common/highlightUtils';
import flatMap from 'lodash/flatMap';
import uniq from 'lodash/uniq';

type Props = PdfViewerProps &
  HighlightProps & {
    /**
     * Passage or table to highlight in document.
     * This property overrides `highlights` property if specified
     */
    highlight?: QueryResultPassage | QueryTableResult;
    /**
     * Highlight spans on fields in document
     */
    highlights?: DocumentFieldHighlight[];
  };

/**
 * PDF viewer component with text highlighting capability
 */
const PdfViewerWithHighlight: FC<Props> = ({
  highlightClassName,
  activeHighlightClassName,
  document,
  page,
  highlight,
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
    _useHtmlBbox,
    _usePdfTextItem
  };

  const [renderedText, setRenderedText] = useState<PdfRenderedText | null>(null);
  const isTableHighlight = isTable(highlight);
  const documentInfo = useAsyncFunctionCall(
    useCallback(
      async () =>
        document ? await extractDocumentInfo(document, { table: isTableHighlight }) : undefined,
      [document, isTableHighlight]
    )
  );

  const hlState = useHighlightState({ highlight, highlights, activeIds, documentInfo });
  const currentPage = useMovePageToActiveHighlight(page, hlState.activePages, setCurrentPage);

  const highlightReady = !!documentInfo && !!renderedText;
  return (
    <PdfViewer {...rest} page={currentPage} setRenderedText={setRenderedText}>
      {(hlState.fields || hlState.bboxes) && (
        <PdfHighlight
          parsedDocument={highlightReady ? documentInfo ?? null : null}
          pdfRenderedText={highlightReady ? renderedText : null}
          page={currentPage}
          scale={scale}
          highlights={hlState.fields}
          boxHighlights={hlState.bboxes}
          activeIds={hlState.activeIds}
          {...highlightProps}
        />
      )}
    </PdfViewer>
  );
};

type HighlightState = {
  activePages: number[];
  activeIds?: string[];
  fields?: DocumentFieldHighlight[];
  bboxes?: DocumentBboxHighlight[];
};

/**
 * Hook to calculate highlights passed to <PdfHighlight>
 * from given highlight-related properties (highlight, highlights, activeIds)
 */
function useHighlightState({
  highlight: queryHighlight,
  highlights,
  activeIds,
  documentInfo
}: Pick<Props, 'highlight' | 'highlights' | 'activeIds'> & {
  documentInfo?: ExtractedDocumentInfo;
}): HighlightState {
  const [state, setState] = useState<HighlightState>({ activePages: [] });

  useEffect(() => {
    if (isTable(queryHighlight)) {
      const table = getHighlightTable(queryHighlight, documentInfo?.processedDoc);
      const bboxHighlights = table ? convertToDocumentBboxHighlights(table) : null;
      if (bboxHighlights?.length) {
        setState({
          activePages: uniq(flatMap(bboxHighlights, hl => hl.bboxes.map(bbox => bbox.page))),
          activeIds: [DEFAULT_HIGHLIGHT_ID],
          bboxes: bboxHighlights
        });
        return;
      }
    } else if (isPassage(queryHighlight)) {
      const fields = queryHighlight ? convertToDocumentFieldHighlights(queryHighlight) : null;
      if (fields?.length) {
        setState({
          activePages: getPagesFromHighlights(documentInfo?.textMappings, fields),
          activeIds: [DEFAULT_HIGHLIGHT_ID],
          fields
        });
        return;
      }
    } else if (highlights) {
      setState({
        activePages: getPagesFromHighlights(documentInfo?.textMappings, highlights, activeIds),
        activeIds,
        fields: highlights
      });
      return;
    }

    setState({
      activePages: []
    });
  }, [activeIds, documentInfo, highlights, queryHighlight]);

  return state;
}

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
  }, [currentPage, page]);

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
      setCurrentPage(highlightPage);
      setPage?.(highlightPage);
    }
  }, [activeHighlightPages, currentPage, setPage]);

  return currentPage;
}

function getPagesFromHighlights(
  textMappings: TextMappings | null | undefined,
  highlights: DocumentFieldHighlight[],
  activeIds?: string[]
) {
  const activePages = (highlights || [])
    .map(highlight => {
      if (!activeIds || (highlight.id && activeIds.includes(highlight.id))) {
        return textMappings ? getPageFromHighlight(textMappings, highlight) : null;
      }
      return null;
    })
    .filter(nonEmpty);
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
