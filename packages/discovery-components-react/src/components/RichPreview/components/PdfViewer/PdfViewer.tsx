import React, { SFC, useEffect, useRef, useState } from 'react';
import PdfjsLib from 'pdfjs-dist';
import PdfjsWorker from 'pdfjs-dist/lib/pdf.worker.js';

PdfjsLib.GlobalWorkerOptions.workerSrc = PdfjsWorker;

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
}

const PdfViewer: SFC<Props> = ({ file, page, scale }) => {
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
        }
      }
    }
    loadPdf();

    return (): void => {
      didCancel = true;
    };
  }, [file]);

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
    }
  }, [loadedPage, scale]);

  return <canvas ref={canvasRef} />;
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

export default PdfViewer;
