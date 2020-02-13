import React, { FC, ReactElement, useContext, useEffect, useState } from 'react';
import { SkeletonText } from 'carbon-components-react';
import { settings } from 'carbon-components';
import { QueryResult, QueryResultPassage, QueryTableResult } from 'ibm-watson/discovery/v2';
import { SearchContext } from 'components/DiscoverySearch/DiscoverySearch';
import { PreviewToolbar } from './components/PreviewToolbar/PreviewToolbar';
import SimpleDocument from './components/SimpleDocument/SimpleDocument';
import withErrorBoundary, { WithErrorBoundaryProps } from 'utils/hoc/withErrorBoundary';
import { defaultMessages, Messages } from './messages';
import HtmlView from './components/HtmlView/HtmlView';

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

  const base = `${settings.prefix}--document-preview`;

  return (
    <div className={`${base}`}>
      {(doc || file) && !didCatch ? (
        <>
          <PreviewToolbar
            loading={loading}
            hideControls={hideToolbarControls}
            current={currentPage}
            total={0}
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
              document={doc}
              highlight={highlight}
              setLoading={setLoading}
              setHideToolbarControls={setHideToolbarControls}
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

interface PreviewDocumentProps {
  document?: QueryResult | null;
  highlight?: any;
  setLoading: (loading: boolean) => void;
  setHideToolbarControls?: (disabled: boolean) => void;
}

function PreviewDocument({
  document,
  setLoading,
  setHideToolbarControls,
  highlight
}: PreviewDocumentProps): ReactElement | null {
  if (document) {
    if (document.html) {
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
