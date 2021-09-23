import React, { SFC, useEffect, useRef, useState } from 'react';
// TODO don't use legacy build
import PdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import PdfjsWorkerAsText from 'pdfjs-dist/legacy/build/pdf.worker.min.js';
import { settings } from 'carbon-components';

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
  setPageCount?: (count: number) => void;
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // In order to prevent unnecessary re-loading, loaded file and page are stored in state
  const [loadedFile, setLoadedFile] = useState<any>(null);
  const [loadedPage, setLoadedPage] = useState<any>(null);

  useEffect(() => {
    let didCancel = false;

    async function loadPdf(): Promise<void> {
      if (file) {
        const newPdf = await _loadPdf(file);
        if (!didCancel) {
          setLoadedFile(newPdf);
          if (setPageCount) {
            setPageCount(newPdf.numPages);
          }
        }
      }
    }
    loadPdf();

    return (): void => {
      didCancel = true;
    };
  }, [file, setPageCount]);

  useEffect(() => {
    let didCancel = false;

    async function loadPage(): Promise<void> {
      if (loadedFile && page > 0) {
        const newPage = await _loadPage(loadedFile, page);
        if (!didCancel) {
          setLoadedPage(newPage);
        }
      }
    }
    loadPage();

    return (): void => {
      didCancel = true;
    };
  }, [loadedFile, page]);

  useEffect(() => {
    if (loadedPage && !loadedPage.then) {
      _renderPage(loadedPage, canvasRef.current!, scale);
      setLoading(false);
    }
  }, [loadedPage, scale, setLoading]);

  useEffect(() => {
    if (setHideToolbarControls) {
      setHideToolbarControls(false);
    }
  }, [setHideToolbarControls]);

  return (
    <canvas
      style={{
        transform: `scale(${scale})`
      }}
      ref={canvasRef}
      className={`${settings.prefix}--document-preview-pdf-viewer`}
    />
  );
};

PdfViewer.defaultProps = {
  page: 1,
  scale: 1
};

function _loadPdf(data: string): Promise<any> {
  return PdfjsLib.getDocument({ data }).promise;
}

function _loadPage(file: any, page: number): Promise<any> {
  return file.getPage(page);
}

function _renderPage(pdfPage: any, canvas: HTMLCanvasElement, scale: number): void {
  const viewport = pdfPage.getViewport({ scale });
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  pdfPage.render({ canvasContext: canvas.getContext('2d'), viewport });
}

// set up web worker for use by PDF.js library
// @see https://stackoverflow.com/a/6454685/908343
function setupPdfjs(): void {
  if (typeof Worker !== 'undefined') {
    const blob = new Blob([PdfjsWorkerAsText], { type: 'text/javascript' });
    const pdfjsWorker = new Worker(URL.createObjectURL(blob));
    PdfjsLib.GlobalWorkerOptions.workerPort = pdfjsWorker;
  } else {
    PdfjsLib.GlobalWorkerOptions.workerSrc = PdfjsWorkerAsText;
  }
}

export default PdfViewer;
