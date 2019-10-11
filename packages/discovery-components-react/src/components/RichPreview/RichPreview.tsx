import React, { FC, useState, useEffect, ReactElement } from 'react';
import get from 'lodash/get';
import { settings } from 'carbon-components';
import RichPreviewToolbar, { ZOOM_IN } from './components/RichPreviewToolbar/RichPreviewToolbar';
import PdfViewer from './components/PdfViewer/PdfViewer';
import PdfFallback from './components/PdfFallback/PdfFallback';
import PassageHighlight from './components/PassageHighlight/PassageHighlight';

interface Props {
  /**
   * Document data returned by query
   */
  document: any; // TODO should be `QueryResult`? but `title` props mismatch

  /**
   * PDF file data as base64-encoded string
   */
  file?: string;
}

const SCALE_FACTOR = 1.2;

export const RichPreview: FC<Props> = ({ document, file }) => {
  const base = `${settings.prefix}--rich-preview`;

  // If passage, initialize first page to that of passage; otherwise
  // default to first page
  const passage = get(document, 'document_passages[0]'); // Only look for first passage, if available
  const [currentPage, setCurrentPage] = useState(0);
  const [passageFirstPage, setPassageFirstPage] = useState(0);
  useEffect(() => {
    if (!passage) {
      setCurrentPage(1);
    } else if (passageFirstPage > 0) {
      setCurrentPage(passageFirstPage);
    }
  }, [passage, passageFirstPage]);

  // Pull total page count from either the PDF file or the structural
  // data list
  const [pageCount, setPageCount] = useState(0);
  const [pdfPageCount, setPdfPageCount] = useState(pageCount);
  useEffect(() => {
    if (file) {
      setPageCount(pdfPageCount);
    } else if (document.extracted_metadata.text_mappings) {
      const mappings = document.extracted_metadata.text_mappings;
      setPageCount(mappings[mappings.length - 1].page.page_number);
    }
  }, [document.extracted_metadata.text_mappings, file, pdfPageCount]);

  const [scale, setScale] = useState(1);

  const loading = !(currentPage > 0) || !(pageCount > 0);

  return (
    <div className={`${base}`}>
      <RichPreviewToolbar
        loading={loading}
        current={currentPage}
        total={pageCount}
        onChange={setCurrentPage}
        onZoom={(zoom): void => {
          setScale(zoom === ZOOM_IN ? scale * SCALE_FACTOR : scale / SCALE_FACTOR);
        }}
      />
      <div className={`${base}__document`}>
        <RichPreviewDocument
          file={file}
          currentPage={currentPage}
          scale={scale}
          document={document}
          setPdfPageCount={setPdfPageCount}
        />
        {/* highlight passage on top of document view */}
        <div className={`${base}__passage`}>
          <PassageHighlight
            highlightClassname={`${base}__highlight`}
            document={document}
            currentPage={currentPage}
            passage={passage}
            setPassageFirstPage={setPassageFirstPage}
          />
        </div>
      </div>
    </div>
  );
};

interface DocumentProps {
  document: any;
  file?: string;
  currentPage: number;
  scale: number;
  setPdfPageCount?: (count: number) => void;
}

function RichPreviewDocument({
  file,
  currentPage,
  scale,
  document,
  setPdfPageCount
}: DocumentProps): ReactElement {
  // if we have PDF data, render that
  // otherwise, render fallback document view
  return file ? (
    <PdfViewer file={file} page={currentPage} scale={scale} setPageCount={setPdfPageCount} />
  ) : (
    <PdfFallback document={document} currentPage={currentPage} />
  );
}

export default RichPreview;
export { RichPreviewToolbar, RichPreviewDocument };
