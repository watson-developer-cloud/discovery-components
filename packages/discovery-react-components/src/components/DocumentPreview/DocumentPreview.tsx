import React, { FC, ReactElement, useContext, useEffect, useState } from 'react';
import { SkeletonText } from 'carbon-components-react';
import { settings } from 'carbon-components';
import { QueryResult, QueryResultPassage, QueryTableResult } from 'ibm-watson/discovery/v2';
import { SearchContext } from 'components/DiscoverySearch/DiscoverySearch';
import { PreviewToolbar } from './components/PreviewToolbar/PreviewToolbar';
import PdfViewer from './components/PdfViewer/PdfViewer';
import SimpleDocument from './components/SimpleDocument/SimpleDocument';
import withErrorBoundary, { WithErrorBoundaryProps } from 'utils/hoc/withErrorBoundary';
import { defaultMessages, Messages } from './messages';
import HtmlView from './components/HtmlView/HtmlView';
import { getTextMappings, isCsvFile, isJsonFile } from './utils/documentData';
import { TextMappings } from './types';

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
   * Passage or table to highlight in document. Reference to item with
   * `document.document_passages` or `document.table_results`.
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
  const { selectedResult, documentProvider } = useContext(SearchContext);

  const [scale, setScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hideToolbarControls, setHideToolbarControls] = useState(false);
  const [providedFile, setProvidedFile] = useState<string | undefined>();

  // document prop takes precedence over that in context
  const doc = document || selectedResult.document;
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

  // fetch PDF (if necessary)
  useEffect(() => {
    async function fetchFile() {
      const hasFile = await documentProvider!.provides(document!);
      if (hasFile) {
        setProvidedFile(await documentProvider?.get(document!));
      }
    }

    // `file` takes precedence over a file provided by `documentProvider`
    if (file) {
      setProvidedFile(file);
    } else if (document && documentProvider) {
      fetchFile();
    } else {
      setProvidedFile(undefined);
    }
  }, [document, documentProvider, file]);

  // TODO Seems like these 2 useEffects should just be part of PdfViewer
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
    if (providedFile && pdfPageCount > 0) {
      setPageCount(pdfPageCount);
    } else if (textMappings) {
      const last = textMappings.text_mappings.length - 1;
      setPageCount(textMappings?.text_mappings[last].page.page_number ?? 1);
    }
  }, [textMappings, providedFile, pdfPageCount]);

  const base = `${settings.prefix}--document-preview`;

  return (
    <div className={`${base}`}>
      {(doc || providedFile) && !didCatch ? (
        <>
          {/* TODO This is only used when showing PDFs (currently). Should be moved into `PdfViewer` or
                    elsewhere that makes more sense.
          */}
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
  file?: string;
  highlight?: any;
  currentPage: number;
  scale: number;
  setPdfPageCount?: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setHideToolbarControls?: (disabled: boolean) => void;
  loading: boolean;
  hideToolbarControls: boolean;
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
        hideToolbarControls={hideToolbarControls}
        setHideToolbarControls={setHideToolbarControls}
        loading={loading}
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
