import React, { FC, ReactElement, useContext, useEffect, useState } from 'react';
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
import Highlight from './components/Highlight/Highlight';

interface Props {
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
}

const SCALE_FACTOR = 1.2;

export const DocumentPreview: FC<Props> = ({ document, file, highlight }) => {
  const { selectedResult } = useContext(SearchContext);
  // document prop takes precedence over that in context
  const doc = document || selectedResult.document;
  highlight = highlight || selectedResult.element || undefined;

  const [scale, setScale] = useState(1);

  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    // reset state if document changes
    setCurrentPage(1);
    //reset scale if document changes
    setScale(1);
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

  const loading = !doc || !(currentPage > 0) || !(pageCount > 0);

  const base = `${settings.prefix}--document-preview`;
  const previewBase = `${settings.prefix}--preview`;

  return (
    <div className={`${base}`}>
      {doc || file ? (
        <>
          <PreviewToolbar
            loading={loading}
            current={currentPage}
            total={pageCount}
            onChange={setCurrentPage}
            onZoom={(zoom): void => {
              if (zoom === ZOOM_IN || zoom === ZOOM_OUT) {
                setScale(zoom === ZOOM_IN ? scale * SCALE_FACTOR : scale / SCALE_FACTOR);
              } else {
                setScale(1);
              }
            }}
          />
          <div className={`${previewBase}__document`}>
            <PreviewDocument
              file={file}
              currentPage={currentPage}
              scale={scale}
              document={doc}
              highlight={highlight}
              setPdfPageCount={setPdfPageCount}
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
        </>
      ) : (
        <div>No document data</div>
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
}

function PreviewDocument({
  file,
  currentPage,
  scale,
  document,
  highlight,
  setPdfPageCount
}: DocumentProps): ReactElement | null {
  // if we have PDF data, render that
  // otherwise, render fallback document view
  return file ? (
    <PdfViewer file={file} page={currentPage} scale={scale} setPageCount={setPdfPageCount} />
  ) : document ? (
    supportsPdfFallback(document) ? (
      <PdfFallback
        key={document && document.id}
        document={document}
        currentPage={currentPage}
        scale={scale}
      />
    ) : (
      <SimpleDocument document={document} highlight={highlight} />
    )
  ) : null;
}

export default DocumentPreview;
export { PreviewToolbar, PreviewDocument, ZOOM_IN, ZOOM_OUT, ZOOM_RESET };
