import React, { SFC, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { settings } from 'carbon-components';
import PdfjsWorkerAsText from 'pdfjs-dist/build/pdf.worker.min.js';

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

setupPdfjsWorker();

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

const PdfViewer: SFC<Props> = ({
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
    <div data-testid="pdf-view">
      <Document
        file={`data:application/pdf;base64,${file}`}
        onLoadSuccess={({ numPages }) => setPageCount(numPages)}
        loading=" "
        options={{
          cMapUrl: 'cmaps/',
          cMapPacked: true
        }}
      >
        <Page
          className={`${settings.prefix}--document-preview-pdf-viewer`}
          pageNumber={page}
          loading=" "
          onLoadSuccess={() => setLoading(false)}
          onLoadError={error => alert('Error loading page! ' + error.message)}
          scale={scale}
        />
      </Document>
    </div>
  );
};

function setupPdfjsWorker(): void {
  if (typeof Worker !== 'undefined') {
    const blob = new Blob([PdfjsWorkerAsText], { type: 'text/javascript' });
    const pdfjsWorker = new Worker(URL.createObjectURL(blob));
    pdfjs.GlobalWorkerOptions.workerPort = pdfjsWorker;
  } else {
    pdfjs.GlobalWorkerOptions.workerSrc = PdfjsWorkerAsText;
  }
}

export default PdfViewer;
