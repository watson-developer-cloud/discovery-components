import React, { FC, ReactElement, useContext, useEffect, useState } from 'react';
import { SkeletonText } from 'carbon-components-react';
import get from 'lodash/get';
import { settings } from 'carbon-components';
import {
  QueryResult,
  QueryResultPassage,
  QueryTableResult
} from '@disco-widgets/ibm-watson/discovery/v2';
import { SearchContext } from '../DiscoverySearch/DiscoverySearch';
import PreviewToolbar, {
  ZOOM_IN,
  ZOOM_OUT,
  ZOOM_RESET
} from './components/PreviewToolbar/PreviewToolbar';
import PdfViewer from './components/PdfViewer/PdfViewer';
import PdfFallback, { supportsPdfFallback } from './components/PdfFallback/PdfFallback';
import SimpleDocument from './components/SimpleDocument/SimpleDocument';
import HtmlView from './components/HtmlView/HtmlView';
import Highlight from './components/Highlight/Highlight';
import withErrorBoundary, { WithErrorBoundaryProps } from '../../utils/hoc/withErrorBoundary';
import { defaultMessages, Messages } from './messages';

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
  const [disabledToolbar, setDisabledToolbar] = useState(false);

  useEffect(() => {
    // reset state if document changes
    setCurrentPage(1);
    //reset scale if document changes
    setScale(1);
    // TODO disable for now, until we can properly fix https://github.ibm.com/Watson-Discovery/docviz-squad-issue-tracker/issues/143
    // setLoading(true);
  }, [doc]);

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

  // Pull total page count from either the PDF file or the structural
  // data list
  const textMappings = get(doc, 'extracted_metadata.text_mappings');
  const [pageCount, setPageCount] = useState(0);
  const [pdfPageCount, setPdfPageCount] = useState(pageCount);
  useEffect(() => {
    if (file && pdfPageCount > 0) {
      setPageCount(pdfPageCount);
    } else if (textMappings) {
      setPageCount(textMappings.cells[textMappings.cells.length - 1].page.page_number);
    }
  }, [textMappings, file, pdfPageCount]);

  const base = `${settings.prefix}--document-preview`;

  return (
    <div className={`${base}`}>
      {(doc || file) && !didCatch ? (
        <>
          <PreviewToolbar
            loading={disabledToolbar || loading}
            current={currentPage}
            total={loading ? 0 : pageCount}
            onChange={setCurrentPage}
            onZoom={(zoom): void => {
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
              currentPage={currentPage}
              scale={scale}
              document={doc}
              highlight={highlight}
              setPdfPageCount={setPdfPageCount}
              setLoading={setLoading}
              setDisabledToolbar={setDisabledToolbar}
            />
            {/* highlight on top of document view */}
            <div className={`${base}__highlight-overlay`}>
              <Highlight
                highlightClassname={`${base}__highlight`}
                document={doc}
                currentPage={currentPage}
                highlight={highlight}
                setHighlightFirstPage={setHighlightFirstPage}
              />
            </div>
          </div>
          {loading && (
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

interface DocumentProps {
  document?: QueryResult | null;
  file?: string;
  highlight?: any;
  currentPage: number;
  scale: number;
  setPdfPageCount?: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setDisabledToolbar: (disabled: boolean) => void;
}

function PreviewDocument({
  file,
  currentPage,
  scale,
  document,
  setPdfPageCount,
  setLoading,
  setDisabledToolbar,
  highlight
}: DocumentProps): ReactElement | null {
  // if we have PDF data, render that
  // otherwise, render fallback document view
  if (file) {
    return (
      <PdfViewer
        file={file}
        page={currentPage}
        scale={scale}
        setPageCount={setPdfPageCount}
        setLoading={setLoading}
      />
    );
  }

  if (document) {
    if (supportsPdfFallback(document)) {
      return (
        <PdfFallback
          key={document && document.id}
          document={document}
          currentPage={currentPage}
          scale={scale}
          setLoading={setLoading}
        />
      );
    }

    const isHtmlType = get(document, 'extracted_metadata.file_type') === 'html';

    if (isHtmlType) {
      return <HtmlView document={document} />;
    }

    return (
      <SimpleDocument
        document={document}
        highlight={highlight}
        setDisabledToolbar={setDisabledToolbar}
        setLoading={setLoading}
      />
    );
  }

  return null;
}

const ErrorBoundDocumentPreview = withErrorBoundary(DocumentPreview);
export default ErrorBoundDocumentPreview;
export {
  ErrorBoundDocumentPreview as DocumentPreview,
  PreviewToolbar,
  PreviewDocument,
  ZOOM_IN,
  ZOOM_OUT,
  ZOOM_RESET
};
