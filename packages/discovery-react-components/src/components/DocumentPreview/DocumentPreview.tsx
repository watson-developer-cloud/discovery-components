import React, { FC, ReactElement, useContext, useEffect, useState } from 'react';
import { SkeletonText } from 'carbon-components-react';
import get from 'lodash/get';
import { settings } from 'carbon-components';
import { QueryResult, QueryResultPassage, QueryTableResult } from 'ibm-watson/discovery/v2';
import { SearchContext } from 'components/DiscoverySearch/DiscoverySearch';
import { PreviewToolbar } from './components/PreviewToolbar/PreviewToolbar';
import PdfViewer from './components/PdfViewer/PdfViewer';
import Highlight from './components/Highlight/Highlight';
import SimpleDocument from './components/SimpleDocument/SimpleDocument';
import withErrorBoundary, { WithErrorBoundaryProps } from 'utils/hoc/withErrorBoundary';
import { defaultMessages, Messages } from './messages';
import HtmlView from './components/HtmlView/HtmlView';
import { isCsvFile, isJsonFile } from './utils/documentData';
import { TextMappings } from './types';
import { getTextMappings } from './utils/documentData';

const { ZOOM_IN, ZOOM_OUT } = PreviewToolbar;

interface Props extends WithErrorBoundaryProps {
  /**
   * Document data, as that returned by a query. Overrides result from SearchContext
   */
  document?: QueryResult;
  /**
   * PDF file data as base64-encoded string
   */
  file?: string;
  /**
   * Passage or table to highlight in document. Reference to item with
   * `document.document_passages` or `document.table_results`
   */
  highlight?: QueryResultPassage | QueryTableResult;
  /**
   * i18n messages for the component
   */
  messages?: Messages;
}

const SCALE_FACTOR = 1.2;

const DocumentPreview: FC<Props> = ({
  document,
  file,
  highlight,
  messages = defaultMessages,
  didCatch
}) => {
  const { selectedResult } = useContext(SearchContext);
  // document prop takes precedence over that in context
  const doc = document || selectedResult.document;
  highlight = highlight || selectedResult.element || undefined;

  const [scale, setScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hideToolbarControls, setHideToolbarControls] = useState(false);
  const [loadingDone, setLoadingDone] = useState(false);

  useEffect(() => {
    // reset state if document changes
    setCurrentPage(1);
    //reset scale if document changes
    setScale(1);
    // TODO disable for now, until we can properly fix https://github.ibm.com/Watson-Discovery/docviz-squad-issue-tracker/issues/143
    setLoading(true);
    console.log('This should not be called');
  }, [doc]);

  useEffect(() => {
    console.log('useEffect loading: ' + loading);
    setLoadingDone(!loading);
  }, [loading]);

  // If highlight, initialize first page to that of highlight; otherwise
  // default to first page
  const [highlightFirstPage, setHighlightFirstPage] = useState(0);
  useEffect(() => {
    if (!highlight) {
      setCurrentPage(1);
    } else if (highlightFirstPage > 0) {
      setCurrentPage(highlightFirstPage);
    }
  }, [highlight, highlightFirstPage]);

  const [textMappings, setTextMappings] = useState<TextMappings | null>(null);
  useEffect(() => {
    const mappings = getTextMappings(doc);
    if (mappings) {
      setTextMappings(mappings);
    }
  }, [doc]);

  const [pageCount, setPageCount] = useState(0);
  const [pdfPageCount, setPdfPageCount] = useState(pageCount);
  useEffect(() => {
    if (file && pdfPageCount > 0) {
      setPageCount(pdfPageCount);
    } else if (textMappings) {
      const last = textMappings.text_mappings.length - 1;
      setPageCount(get(textMappings, `text_mappings[${last}].page.page_number`, 1));
    }
  }, [textMappings, file, pdfPageCount]);

  const base = `${settings.prefix}--document-preview`;

  console.log(loadingDone);

  return (
    <div className={`${base}`}>
      {(doc || file) && !didCatch ? (
        <>
          <PreviewToolbar
            loading={!loadingDone}
            hideControls={hideToolbarControls}
            current={currentPage}
            total={!loadingDone ? 0 : pageCount}
            onChange={setCurrentPage}
            onZoom={(zoom: any): void => {
              if (zoom === ZOOM_IN || zoom === ZOOM_OUT) {
                setScale(zoom === ZOOM_IN ? scale * SCALE_FACTOR : scale / SCALE_FACTOR);
              } else {
                setScale(1);
              }
            }}
          />
          <div className={`${base}__document`}>
            <PreviewDocument
              file={file}
              document={doc}
              currentPage={currentPage}
              scale={scale}
              setPageCount={setPdfPageCount}
              highlight={highlight}
              setLoading={setLoading}
              setHideToolbarControls={setHideToolbarControls}
            />
            {/* highlight on top of document view */
            file && (
              <div className={`${base}__highlight-overlay`}>
                <Highlight
                  highlightClassname={`${base}__highlight`}
                  document={doc}
                  currentPage={currentPage}
                  highlight={highlight}
                  setHighlightFirstPage={setHighlightFirstPage}
                />
              </div>
            )}
          </div>
          {!loadingDone && (
            <div className={`${base}__skeleton`}>
              <SkeletonText paragraph={true} lineCount={40} />
            </div>
          )}
        </>
      ) : didCatch ? (
        <div className={`${base}__error`}>{messages.errorMessage}</div>
      ) : (
        <div className={`${base}__error`}>{messages.noDataMessage}</div>
      )}
    </div>
  );
};

interface PreviewDocumentProps {
  file?: string;
  document?: QueryResult | null;
  currentPage: number;
  scale: number;
  setPageCount: (count: number) => void;
  highlight?: any;
  setLoading: (loading: boolean) => void;
  setHideToolbarControls?: (disabled: boolean) => void;
}

function PreviewDocument({
  file,
  currentPage,
  scale,
  document,
  setPageCount,
  setLoading,
  setHideToolbarControls,
  highlight
}: PreviewDocumentProps): ReactElement | null {
  if (file) {
    return (
      <PdfViewer
        file={file}
        page={currentPage}
        scale={scale}
        setPageCount={setPageCount}
        setLoading={setLoading}
        setHideToolbarControls={setHideToolbarControls}
      />
    );
  }
  if (document) {
    const isJsonType = isJsonFile(document);
    const isCsvType = isCsvFile(document);
    if (document.html && !isJsonType && !isCsvType) {
      return (
        <HtmlView
          document={document}
          highlight={highlight}
          setHideToolbarControls={setHideToolbarControls}
          setLoading={setLoading}
        />
      );
    }
    return (
      <SimpleDocument
        document={document}
        highlight={highlight}
        setHideToolbarControls={setHideToolbarControls}
        setLoading={setLoading}
      />
    );
  }

  return null;
}

//Replace any with a proper TS check
const ErrorBoundDocumentPreview: any = withErrorBoundary(DocumentPreview);
ErrorBoundDocumentPreview.PreviewToolbar = PreviewToolbar;
ErrorBoundDocumentPreview.PreviewDocument = PreviewDocument;

export default ErrorBoundDocumentPreview;
export { ErrorBoundDocumentPreview as DocumentPreview };
