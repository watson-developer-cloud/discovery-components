import React, { SFC, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import PdfjsWorkerAsText from 'pdfjs-dist/build/pdf.worker.min.js';

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

setupPdfjs();

interface Props {
  /**
   * PDF file data as base64-encoded string
   */
  file: string;
  /**
   * Page number, starting at 1
   */
  page: number;
  /**
   * Zoom factor, where `1` is equal to 100%
   */
  scale: number;
  /**
   * Callback invoked with page count, once `file` has been parsed
   */
  setPageCount: (count: number) => void;
  /**
   * Check if document is loading
   */
  setLoading: (loading: boolean) => void;
  /**
   * Callback which is invoked with whether to enable/disable toolbar controls
   */
  setHideToolbarControls?: (disabled: boolean) => void;
}

const ReactPdfViewer: SFC<Props> = ({
  file,
  page,
  scale,
  setPageCount,
  setLoading,
  setHideToolbarControls
}) => {
  useEffect(() => {
    if (setHideToolbarControls) {
      setHideToolbarControls(false);
    }
  }, [setHideToolbarControls]);

  return (
    <div>
      <Document
        file={`data:application/pdf;base64,${file}`}
        onLoadSuccess={({ numPages }: any) => setPageCount(numPages)}
      >
        <Page pageNumber={page} loading=" " onLoadSuccess={() => setLoading(false)} scale={scale} />
      </Document>
    </div>
  );
};

function setupPdfjs(): void {
  if (typeof Worker !== 'undefined') {
    const blob = new Blob([PdfjsWorkerAsText], { type: 'text/javascript' });
    const pdfjsWorker = new Worker(URL.createObjectURL(blob));
    pdfjs.GlobalWorkerOptions.workerPort = pdfjsWorker;
  } else {
    pdfjs.GlobalWorkerOptions.workerSrc = PdfjsWorkerAsText;
  }
}

export default ReactPdfViewer;
