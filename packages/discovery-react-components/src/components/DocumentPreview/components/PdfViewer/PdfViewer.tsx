import React, { SFC, useEffect, useRef, useState, useMemo } from 'react';
import PdfjsLib from 'pdfjs-dist';
import PdfjsWorkerAsText from 'pdfjs-dist/build/pdf.worker.min.js';
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
   * Consider device pixel ration on rendering
   */
  useDeviceResolution?: boolean;

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
  useDeviceResolution = true,
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

  const [viewport, canvasInfo] = useMemo(() => {
    const viewport = loadedPage?.getViewport({ scale });
    const canvasInfo = viewport ? getCanvasInfo(viewport, useDeviceResolution) : undefined;
    return [viewport, canvasInfo];
  }, [loadedPage, scale, useDeviceResolution]);

  useEffect(() => {
    if (loadedPage && !loadedPage.then && viewport && canvasInfo) {
      _renderPage(loadedPage, canvasRef.current!, viewport, canvasInfo);
      setLoading(false);
    }
  }, [loadedPage, viewport, canvasInfo, setLoading]);

  useEffect(() => {
    if (setHideToolbarControls) {
      setHideToolbarControls(false);
    }
  }, [setHideToolbarControls]);

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

function _loadPage(file: any, page: number): Promise<any> {
  return file.getPage(page);
}

function _renderPage(
  pdfPage: any,
  canvas: HTMLCanvasElement,
  viewport: any,
  canvasInfo: CanvasInfo
): void {
  canvas.style.width = `${canvasInfo.width}px`;
  canvas.style.height = `${canvasInfo.height}px`;
  canvas.width = canvasInfo.canvasWidth;
  canvas.height = canvasInfo.canvasHeight;

  const canvasContext = canvas.getContext('2d');
  canvasContext?.scale(canvasInfo.canvasScale, canvasInfo.canvasScale);
  pdfPage.render({ canvasContext: canvasContext, viewport });
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

type CanvasInfo = {
  width: number;
  height: number;
  canvasWidth: number;
  canvasHeight: number;
  canvasScale: number;
};

function getCanvasInfo(viewport: any, useDevicePixelRatio: boolean): CanvasInfo {
  const { width, height } = viewport;

  const canvasScale = useDevicePixelRatio ? window.devicePixelRatio ?? 1 : 1;
  const canvasWidth = Math.ceil(width * canvasScale);
  const canvasHeight = Math.ceil(height * canvasScale);

  return { width, height, canvasWidth, canvasHeight, canvasScale };
}

export default PdfViewer;
