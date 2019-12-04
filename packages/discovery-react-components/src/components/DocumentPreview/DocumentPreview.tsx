import React, { FC, ReactElement, useContext, useEffect, useState } from 'react';
import { SkeletonText } from 'carbon-components-react';
import get from 'lodash/get';
import { settings } from 'carbon-components';
import { QueryResult, QueryResultPassage, QueryTableResult } from 'ibm-watson/discovery/v2';
import { SearchContext } from '@DiscoverySearch/DiscoverySearch';
import { PreviewToolbar } from '@DocumentPreview/components/PreviewToolbar/PreviewToolbar';
import PdfViewer from '@DocumentPreview/components/PdfViewer/PdfViewer';
import PdfFallback, {
  supportsPdfFallback
} from '@DocumentPreview/components/PdfFallback/PdfFallback';
import SimpleDocument from '@DocumentPreview/components/SimpleDocument/SimpleDocument';
import HtmlView from '@DocumentPreview/components/HtmlView/HtmlView';
import Highlight from '@DocumentPreview/components/Highlight/Highlight';
import { getTextMappings } from '@DocumentPreview/utils/documentData';
import withErrorBoundary, { WithErrorBoundaryProps } from '@rootUtils/hoc/withErrorBoundary';
import { defaultMessages, Messages } from '@DocumentPreview/messages';
import { TextMappings } from '@DocumentPreview/types';

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

  const [textMappings, setTextMappings] = useState<TextMappings | null>(null);
  useEffect(() => {
    const mappings = getTextMappings(doc);
    if (mappings) {
      setTextMappings(mappings);
    }
  }, [doc]);

  // Pull total page count from either the PDF file or the structural
  // data list
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

  return (
    <div className={`${base}`}>
      {(doc || file) && !didCatch ? (
        <>
          <PreviewToolbar
            loading={loading}
            hideControls={hideToolbarControls}
            current={currentPage}
            total={loading ? 0 : pageCount}
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
              currentPage={currentPage}
              scale={scale}
              document={doc}
              highlight={highlight}
              setPdfPageCount={setPdfPageCount}
              setLoading={setLoading}
              setHideToolbarControls={setHideToolbarControls}
            />
            {/* highlight on top of document view */
            (file || supportsPdfFallback(doc)) && (
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

interface PreviewDocumentProps {
  document?: QueryResult | null;
  file?: string;
  highlight?: any;
  currentPage: number;
  scale: number;
  setPdfPageCount?: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setHideToolbarControls?: (disabled: boolean) => void;
}

function PreviewDocument({
  file,
  currentPage,
  scale,
  document,
  setPdfPageCount,
  setLoading,
  setHideToolbarControls,
  highlight
}: PreviewDocumentProps): ReactElement | null {
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
        setHideToolbarControls={setHideToolbarControls}
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
          setHideToolbarControls={setHideToolbarControls}
        />
      );
    }

    const isHtmlType = get(document, 'extracted_metadata.file_type') === 'html';

    if (isHtmlType && document.html) {
      return (
        <HtmlView
          document={document}
          setLoading={setLoading}
          setHideToolbarControls={setHideToolbarControls}
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
