import React, { SFC, useState, useEffect } from 'react';
import get from 'lodash/get';
import { settings } from 'carbon-components';
import RichPreviewToolbar, { ZOOM_IN } from './components/RichPreviewToolbar/RichPreviewToolbar';
import PdfViewer from './components/PdfViewer/PdfViewer';
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

export const RichPreview: SFC<Props> = ({ document, file }) => {
  const base = `${settings.prefix}--rich-preview`;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [pdfPageCount, setPdfPageCount] = useState(1);
  useEffect(() => {
    if (file) {
      setPageCount(pdfPageCount);
    } else if (document.text_mappings) {
      const mappings = document.text_mappings;
      setPageCount(mappings[mappings.length - 1].page.page_number);
    }
  }, [document.text_mappings, file, pdfPageCount]);

  const [scale, setScale] = useState(1);

  // Only look for first passage, if available
  const passage = get(document, 'document_passages[0]');

  return (
    <div className={`${base}`}>
      <RichPreviewToolbar
        current={currentPage}
        total={pageCount}
        onChange={setCurrentPage}
        onZoom={(zoom): void => {
          setScale(zoom === ZOOM_IN ? scale * SCALE_FACTOR : scale / SCALE_FACTOR);
        }}
      />
      <div className={`${base}__document`}>
        {/* if we have PDF data, render that */}
        {/* otherwise, render fallback document view */}
        {file ? (
          <PdfViewer file={file} page={currentPage} scale={scale} setPageCount={setPdfPageCount} />
        ) : (
          document && <div>FALLBACK</div>
        )}
        {/* highlight passage on top of document view */}
        <div className={`${base}__passage`}>
          <PassageHighlight
            highlightClassname={`${base}__highlight`}
            document={document}
            passage={passage}
          />
        </div>
      </div>
    </div>
  );
};

export default RichPreview;
