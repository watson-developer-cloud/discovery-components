import React, { FC, useEffect, useRef, useState, useMemo } from 'react';
import PdfjsLib, {
  PDFDocumentProxy,
  PDFPageProxy,
  PDFPageViewport,
  PDFRenderTask
} from 'pdfjs-dist';
import PdfjsWorkerAsText from 'pdfjs-dist/build/pdf.worker.min.js';
import { settings } from 'carbon-components';

const { RenderingCancelledException } = PdfjsLib as any;

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

const PdfViewer: FC<Props> = ({
  file,
  page,
  scale,
  setPageCount,
  setLoading,
  setHideToolbarControls
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // In order to prevent unnecessary re-loading, loaded file and page are stored in state
  const [loadedFile, setLoadedFile] = useState<PDFDocumentProxy | null>(null);
  const [loadedPage, setLoadedPage] = useState<PDFPageProxy | null>(null);

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

  const currentPage = useMemo(() => {
    const isPageValid = !!loadedPage && loadedPage.pageNumber === page;
    if (isPageValid) {
      const viewport = loadedPage?.getViewport({ scale });
      const canvasInfo = viewport ? getCanvasInfo(viewport) : undefined;
      return { loadedPage, viewport, canvasInfo };
    }
    return null;
  }, [loadedPage, page, scale]);

  useEffect(() => {
    let didCancel = false;
    let task: PDFRenderTask | null = null;

    const { loadedPage, viewport, canvasInfo } = currentPage || {};
    if (loadedPage && !(loadedPage as any).then && viewport && canvasInfo) {
      const render = async () => {
        try {
          task = _renderPage(loadedPage, canvasRef.current!, viewport, canvasInfo);
          await task?.promise;
        } catch (e) {
          if (e instanceof RenderingCancelledException) {
            // ignore
          } else {
            throw e; // rethrow unknown exception
          }
        } finally {
          if (!didCancel) {
            setLoading(false);
          }
        }
      };
      render();
    }
    return () => {
      didCancel = true;
      task?.cancel();
    };
  }, [loadedPage, currentPage, setLoading]);

  useEffect(() => {
    if (setHideToolbarControls) {
      setHideToolbarControls(false);
    }
  }, [setHideToolbarControls]);

  const { canvasInfo } = currentPage || {};
  return (
    <canvas
      ref={canvasRef}
      className={`${settings.prefix}--document-preview-pdf-viewer`}
      style={{ width: `${canvasInfo?.width ?? 0}px`, height: `${canvasInfo?.height ?? 0}px` }}
      width={canvasInfo?.canvasWidth}
      height={canvasInfo?.canvasHeight}
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

function _loadPage(file: PDFDocumentProxy, page: number) {
  return file.getPage(page);
}

function _renderPage(
  pdfPage: PDFPageProxy,
  canvas: HTMLCanvasElement,
  viewport: PDFPageViewport,
  canvasInfo: CanvasInfo
): PDFRenderTask | null {
  const canvasContext = canvas.getContext('2d');
  if (canvasContext) {
    canvasContext.resetTransform();
    canvasContext.scale(canvasInfo.canvasScale, canvasInfo.canvasScale);
    return pdfPage.render({ canvasContext, viewport });
  }
  return null;
}

// set up web worker for use by PDF.js library
// @see https://stackoverflow.com/a/6454685/908343
function setupPdfjs(): void {
  if (typeof Worker !== 'undefined') {
    const blob = new Blob([PdfjsWorkerAsText], { type: 'text/javascript' });
    const pdfjsWorker = new Worker(URL.createObjectURL(blob)) as any;
    PdfjsLib.GlobalWorkerOptions.workerPort = pdfjsWorker;
  } else {
    PdfjsLib.GlobalWorkerOptions.workerSrc = PdfjsWorkerAsText;
  }
}

type CanvasInfo = {
  width: number;
  height: number;
  canvasWidth: number;
  canvasHeight: number;
  canvasScale: number;
};

function getCanvasInfo(viewport: any): CanvasInfo {
  const { width, height } = viewport;

  const canvasScale = window.devicePixelRatio ?? 1;
  const canvasWidth = Math.ceil(width * canvasScale);
  const canvasHeight = Math.ceil(height * canvasScale);

  return { width, height, canvasWidth, canvasHeight, canvasScale };
}

export default PdfViewer;
