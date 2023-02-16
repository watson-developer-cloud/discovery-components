import React, {
  ComponentProps,
  FC,
  ReactElement,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { SkeletonText, Loading } from 'carbon-components-react';
import { settings } from 'carbon-components';
import { QueryResult, QueryResultPassage, QueryTableResult } from 'ibm-watson/discovery/v2';
import { SearchContext } from 'components/DiscoverySearch/DiscoverySearch';
import { PreviewToolbar } from './components/PreviewToolbar/PreviewToolbar';
import SimpleDocument from './components/SimpleDocument/SimpleDocument';
import withErrorBoundary, { WithErrorBoundaryProps } from 'utils/hoc/withErrorBoundary';
import { defaultMessages, Messages } from './messages';
import HtmlView from './components/HtmlView/HtmlView';
import PdfViewerWithHighlight from './components/PdfViewerWithHighlight/PdfViewerWithHighlight';
import { detectPreviewType } from './utils/documentData';
import { useFetchDocumentFile } from './utils/useFetchDocumentFile';
import { DocumentFile } from './types';

const { ZOOM_IN, ZOOM_OUT } = PreviewToolbar;

interface Props extends WithErrorBoundaryProps {
  /**
   * Document data, as that returned by a query. Overrides result from SearchContext.
   */
  document?: QueryResult;
  /**
   * PDF file data as "binary" string (array buffer). Overrides result from SearchContext.documentProvider.
   */
  file?: DocumentFile;
  /**
   * Timeout for fetching PDF document, in milliseconds.
   * If the timeout is exceeded, display HTML or text view.
   */
  fileFetchTimeout?: number;
  /**
   * Class name for the loading indicator which is shown when fetching file.
   */
  loadingClassName?: string;
  /**
   * Passage or table to highlight in document. Reference to item with
   * `document.document_passages` or `searchResults.table_results`.
   */
  highlight?: QueryResultPassage | QueryTableResult;
  /**
   * Disable the text layer overlay when rendering PDF (defaults to `false`)
   */
  disableTextLayer?: boolean;
  /**
   * i18n messages for the component
   */
  messages?: Messages;
  /**
   * URL of hosted PDF worker
   */
  pdfWorkerUrl?: string;
  /**
   * React component rendered as a fallback when no preview is available
   */
  fallbackComponent?: ComponentProps<typeof SimpleDocument>['fallbackComponent'];
  /**
   * Callback to receive changes in document preview state
   */
  onChange?: (state: { currentPage?: number }) => void;
}

const SCALE_FACTOR = 1.2;

const DocumentPreview: FC<Props> = ({
  document,
  file,
  fileFetchTimeout,
  loadingClassName,
  highlight,
  messages = defaultMessages,
  didCatch,
  pdfWorkerUrl,
  fallbackComponent,
  onChange
}) => {
  const { selectedResult } = useContext(SearchContext);

  const [scale, setScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hideToolbarControls, setHideToolbarControls] = useState(false);
  const { providedFile, isFetching } = useFetchDocumentFile({
    file,
    document,
    fetchTimeout: fileFetchTimeout
  });

  // document prop takes precedence over that in context
  const doc = document || selectedResult.document || undefined;
  highlight = highlight || selectedResult.element || undefined;

  // reset state if document changes
  useEffect(() => {
    // reset state if document changes
    setCurrentPage(1);
    //reset scale if document changes
    setScale(1);
    // TODO disable for now, until we can properly fix https://github.ibm.com/Watson-Discovery/docviz-squad-issue-tracker/issues/143
    // setLoading(true);
  }, [doc]);

  const [pdfPageCount, setPdfPageCount] = useState(0);

  // notify state change
  useEffect(() => {
    onChange?.({ currentPage });
  }, [currentPage, onChange]);

  const base = `${settings.prefix}--document-preview`;

  if (isFetching) {
    return <Loading className={loadingClassName} withOverlay={false} />;
  }

  return (
    <div className={`${base}`}>
      {(doc || providedFile) && !didCatch ? (
        <>
          <PreviewToolbar
            loading={loading}
            hideControls={hideToolbarControls}
            current={currentPage}
            total={loading ? 0 : pdfPageCount}
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
              file={providedFile}
              currentPage={currentPage}
              scale={scale}
              document={doc}
              highlight={highlight}
              setPdfPageCount={setPdfPageCount}
              setLoading={setLoading}
              setHideToolbarControls={setHideToolbarControls}
              loading={loading}
              hideToolbarControls={hideToolbarControls}
              setCurrentPage={setCurrentPage}
              pdfWorkerUrl={pdfWorkerUrl}
              fallbackComponent={fallbackComponent}
            />
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

interface PreviewDocumentProps
  extends Pick<
    Props,
    'document' | 'file' | 'highlight' | 'fallbackComponent' | 'disableTextLayer'
  > {
  currentPage: number;
  scale: number;
  setPdfPageCount?: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setHideToolbarControls?: (disabled: boolean) => void;
  loading: boolean;
  hideToolbarControls: boolean;
  setCurrentPage?: (page: number) => void;
  pdfWorkerUrl?: string;
}

const PreviewDocument = forwardRef<any, PreviewDocumentProps>(function PreviewDocument(
  {
    file,
    currentPage,
    scale,
    document,
    loading,
    setPdfPageCount,
    setLoading,
    hideToolbarControls,
    setHideToolbarControls,
    highlight,
    disableTextLayer,
    setCurrentPage,
    pdfWorkerUrl,
    fallbackComponent
  },
  scrollRef
): ReactElement | null {
  const [isPdfRenderError, setIsPdfRenderError] = useState(false);

  const previewType = useMemo(() => {
    return document ? detectPreviewType(document, file, highlight, isPdfRenderError) : null;
  }, [document, file, highlight, isPdfRenderError]);

  if (!document) {
    return null;
  }

  switch (previewType) {
    case 'PDF':
      return (
        <PdfViewerWithHighlight
          file={file!} // PDF preview type ensures that file is not null
          document={document}
          page={currentPage}
          scale={scale}
          setPageCount={setPdfPageCount}
          setLoading={setLoading}
          setHideToolbarControls={setHideToolbarControls}
          highlight={highlight}
          setCurrentPage={setCurrentPage}
          setIsPdfRenderError={setIsPdfRenderError}
          disableTextLayer={disableTextLayer}
          pdfWorkerUrl={pdfWorkerUrl}
          ref={scrollRef}
        />
      );
    case 'HTML':
      return (
        <HtmlView
          document={document}
          highlight={highlight}
          setHideToolbarControls={setHideToolbarControls}
          setLoading={setLoading}
          ref={scrollRef}
        />
      );
    case 'TEXT':
      return (
        <SimpleDocument
          document={document}
          highlight={highlight}
          hideToolbarControls={hideToolbarControls}
          setHideToolbarControls={setHideToolbarControls}
          loading={loading}
          setLoading={setLoading}
          fallbackComponent={fallbackComponent}
          ref={scrollRef}
        />
      );
    default:
      return null;
  }
});

//Replace any with a proper TS check
const ErrorBoundDocumentPreview: any = withErrorBoundary(DocumentPreview);
ErrorBoundDocumentPreview.PreviewToolbar = PreviewToolbar;
ErrorBoundDocumentPreview.PreviewDocument = PreviewDocument;
ErrorBoundDocumentPreview.PdfViewerWithHighlight = PdfViewerWithHighlight;

export default ErrorBoundDocumentPreview;
export { ErrorBoundDocumentPreview as DocumentPreview };
