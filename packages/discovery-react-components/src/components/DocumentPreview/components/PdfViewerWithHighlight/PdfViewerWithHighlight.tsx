import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { settings } from 'carbon-components';
import { QueryResultPassage, QueryTableResult } from 'ibm-watson/discovery/v2';
import { nonEmpty } from 'utils/nonEmpty';
import { FacetInfoMap, TextMappings } from '../../types';
import { spanIntersects } from '../../utils/textSpan';
import { isPassage, isTable } from '../Highlight/typeUtils';
import { getHighlightedTable } from '../Highlight/tables';
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
import isEqual from 'lodash/isEqual';

type Props = PdfViewerProps &
  HighlightProps & {
    /**
     * Passage or table highlight from query result.
     * This property overrides `highlights` property if specified
     */
    highlight?: QueryResultPassage | QueryTableResult;
    facetInfoMap?: FacetInfoMap;
    _isPdfRenderError?: boolean;
    setIsPdfRenderError?: (state: boolean) => any;
  };

/**
 * PDF viewer component with text highlighting capability
 */
const PdfViewerWithHighlight = forwardRef<any, Props>(
  (
    {
      highlightClassName,
      activeHighlightClassName,
      document,
      page,
      highlight: queryHighlight,
      highlights: fieldHighlights,
      activeIds,
      facetInfoMap,
      _useHtmlBbox,
      _usePdfTextItem,
      _isPdfRenderError = false,
      setCurrentPage,
      setIsPdfRenderError,
      ...rest
    },
    scrollRef
  ) => {
    const baseHighlightColor = `${settings.prefix}--category`;
    const { scale } = rest;
    const highlightProps: Omit<HighlightProps, 'highlights'> = {
      highlightClassName,
      activeHighlightClassName,
      document,
      _useHtmlBbox,
      _usePdfTextItem
    };

    const [renderedText, setRenderedText] = useState<PdfRenderedText | null>(null);
    const isTableHighlight = isTable(queryHighlight);

    const [documentInfo, setDocumentInfo] = useState<ExtractedDocumentInfo | undefined>(undefined);
    useEffect(() => {
      async function _setDocumentInfo() {
        if (document) {
          const docInfo = await extractDocumentInfo(document, { tables: isTableHighlight });
          setDocumentInfo(docInfo);
        }
      }

      _setDocumentInfo();
    }, [document, isTableHighlight]);

    const state = useHighlightState({
      queryHighlight,
      fieldHighlights,
      activeIds,
      document,
      documentInfo
    });
    const currentPage = useMovePageToActiveHighlight(
      page,
      state.activePages,
      state.activeIds,
      setCurrentPage
    );

    const setCurrentErrMsgFromPdfConst = useIsPfdError(_isPdfRenderError, setIsPdfRenderError);

    // Dynamically create a style for every category. Match color of category
    const colorStyles = Object.values(facetInfoMap || {})
      .map(facetInfo => {
        return `
        .${baseHighlightColor}-${facetInfo.facetId}.highlight {
          background: ${facetInfo.color};
          border: 2px solid ${facetInfo.color};
        }`;
      })
      .join('\n');

    const highlightReady = !!documentInfo && !!renderedText;
    return (
      <>
        <style>{colorStyles}</style>
        <PdfViewer
          ref={scrollRef}
          {...rest}
          page={currentPage}
          setRenderedText={setRenderedText}
          setIsPdfRenderError={setCurrentErrMsgFromPdfConst}
        >
          {({ fitToWidthRatio }: { fitToWidthRatio: number }) => {
            return (
              (state.fields || state.bboxes) && (
                <PdfHighlight
                  parsedDocument={highlightReady ? documentInfo ?? null : null}
                  pdfRenderedText={highlightReady ? renderedText : null}
                  page={currentPage}
                  scale={scale * fitToWidthRatio}
                  highlights={state.fields}
                  boxHighlights={state.bboxes}
                  activeIds={state.activeIds}
                  facetInfoMap={facetInfoMap}
                  {...highlightProps}
                />
              )
            );
          }}
        </PdfViewer>
      </>
    );
  }
);

type HighlightState = {
  activePages: number[];
  activeIds?: string[];
  fields?: DocumentFieldHighlight[];
  bboxes?: DocumentBboxHighlight[];
};

/**
 * Hook to get highlights to show in <PdfHighlight>
 * from given highlight-related properties (highlight, highlights, activeIds)
 */
function useHighlightState({
  queryHighlight,
  fieldHighlights,
  activeIds,
  document,
  documentInfo
}: {
  queryHighlight: Props['highlight'];
  fieldHighlights: Props['highlights'];
  activeIds: Props['activeIds'];
  document: Props['document'];
  documentInfo?: ExtractedDocumentInfo;
}): HighlightState {
  const [state, setState] = useState<HighlightState>({ activePages: [] });

  useEffect(() => {
    if (queryHighlight) {
      if (isTable(queryHighlight)) {
        const table = getHighlightedTable(queryHighlight, documentInfo?.processedDoc);
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
        const fields = convertToDocumentFieldHighlights(queryHighlight, document);
        if (fields?.length) {
          setState({
            activePages: getPagesFromHighlights(documentInfo?.textMappings, fields),
            activeIds: fields.map(f => f.id || DEFAULT_HIGHLIGHT_ID), // [DEFAULT_HIGHLIGHT_ID],
            fields
          });
          return;
        }
      }
    } else if (fieldHighlights) {
      setState({
        activePages: getPagesFromHighlights(documentInfo?.textMappings, fieldHighlights, activeIds),
        activeIds,
        fields: fieldHighlights
      });
      return;
    }

    setState({
      activePages: []
    });
  }, [activeIds, document, documentInfo, fieldHighlights, queryHighlight]);

  return state;
}

/**
 * Hook to handle PDF render error
 */

export function useIsPfdError(
  isPdfRenderError: boolean,
  callbackIsPdfError?: (state: boolean) => any
) {
  const [currentIsPdfError, setCurrentIsPdfError] = useState(isPdfRenderError);

  // Process error message
  useEffect(() => {
    callbackIsPdfError?.(currentIsPdfError);
  }, [currentIsPdfError, setCurrentIsPdfError, isPdfRenderError, callbackIsPdfError]);

  return setCurrentIsPdfError;
}

/**
 * Hook to move PDF page depending on active highlight
 */
export function useMovePageToActiveHighlight(
  page: number,
  activeHighlightPages: number[],
  activeIds?: string[],
  setPage?: (page: number) => any
) {
  const [currentPage, setCurrentPage] = useState(page);

  // update current page when the 'page' is changed (i.e. user changes the page)
  const previousPageRef = useRef(page);
  useEffect(() => {
    if (
      previousPageRef.current !== page && // `page` is changed by user
      currentPage !== page // `currentPage` is not same to the new `page`
    ) {
      setCurrentPage(page);
    }
    previousPageRef.current = page;
  }, [currentPage, page]);

  // update the current page and invoke setPage when the page is changed by activating a highlight
  const prevHighlightRef = useRef<{ activeHighlightPages?: number[]; activeIds?: string[] }>({});
  useEffect(() => {
    if (activeHighlightPages.length > 0) {
      if (
        !isEqual(prevHighlightRef.current, { activeHighlightPages, activeIds }) && // active highlight is changed
        !activeHighlightPages.includes(currentPage) // `currentPage` doesn't show active highlight page
      ) {
        const highlightPage = activeHighlightPages[0];
        setCurrentPage(highlightPage);
        setPage?.(highlightPage);
      }
    }
    prevHighlightRef.current = { activeHighlightPages, activeIds };
  }, [activeIds, activeHighlightPages, currentPage, setPage]);

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
