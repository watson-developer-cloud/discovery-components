import React, {
  ComponentProps,
  FC,
  ReactElement,
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
import { useFileFetcher } from './utils/useFileFetcher';

const { ZOOM_IN, ZOOM_OUT } = PreviewToolbar;

interface Props extends WithErrorBoundaryProps {
  /**
   * Document data, as that returned by a query. Overrides result from SearchContext.
   */
  document?: QueryResult;
  /**
   * PDF file data as "binary" string (array buffer). Overrides result from SearchContext.documentProvider.
   */
  file?: string;
  /**
   * Timeout milliseconds for loading PDF document.
   * If the timeout is exceeded, give up to show the PDF view although fetching PDF is not be stopped.
   */
  loadFileTimeout?: number;
  /**
   * Passage or table to highlight in document. Reference to item with
   * `document.document_passages` or `document.table_results`.
   */
  highlight?: QueryResultPassage | QueryTableResult;
  /**
   * i18n messages for the component
   */
  messages?: Messages;
  /**
   * React component rendered as a fallback when no preview is available
   */
  fallbackComponent?: ComponentProps<typeof SimpleDocument>['fallbackComponent'];
}

const SCALE_FACTOR = 1.2;

const DocumentPreview: FC<Props> = ({
  document,
  file,
  loadFileTimeout = 0,
  highlight,
  messages = defaultMessages,
  didCatch,
  fallbackComponent
}) => {
  const { selectedResult } = useContext(SearchContext);

  const [scale, setScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hideToolbarControls, setHideToolbarControls] = useState(false);
  const [providedFile, setProvidedFile] = useState<string | undefined>();
  const isFileFetching = useFileFetcher({
    document,
    file,
    timeout: loadFileTimeout,
    setFile: setProvidedFile
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

  const base = `${settings.prefix}--document-preview`;

  if (isFileFetching) {
    return <Loading withOverlay={false} />;
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
  extends Pick<Props, 'document' | 'file' | 'highlight' | 'fallbackComponent'> {
  currentPage: number;
  scale: number;
  setPdfPageCount?: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setHideToolbarControls?: (disabled: boolean) => void;
  loading: boolean;
  hideToolbarControls: boolean;
  setCurrentPage?: (page: number) => void;
}

function PreviewDocument({
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
  setCurrentPage,
  fallbackComponent
}: PreviewDocumentProps): ReactElement | null {
  const previewType = useMemo(
    () => (document ? detectPreviewType(document, file) : null),
    [document, file]
  );

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
        />
      );
    case 'HTML':
      return (
        <HtmlView
          document={document}
          highlight={highlight}
          setHideToolbarControls={setHideToolbarControls}
          setLoading={setLoading}
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
        />
      );
    default:
      return null;
  }
}

//Replace any with a proper TS check
const ErrorBoundDocumentPreview: any = withErrorBoundary(DocumentPreview);
ErrorBoundDocumentPreview.PreviewToolbar = PreviewToolbar;
ErrorBoundDocumentPreview.PreviewDocument = PreviewDocument;
ErrorBoundDocumentPreview.PdfViewerWithHighlight = PdfViewerWithHighlight;

export default ErrorBoundDocumentPreview;
export { ErrorBoundDocumentPreview as DocumentPreview };
