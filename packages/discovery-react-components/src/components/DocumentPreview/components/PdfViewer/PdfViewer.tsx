import React, { FC, useEffect, useRef, useMemo, useCallback } from 'react';
import cx from 'classnames';
import PdfjsLib, {
  PDFDocumentProxy,
  PDFPageProxy,
  PDFPageViewport,
  PDFRenderTask
} from 'pdfjs-dist';
import PdfjsWorkerAsText from 'pdfjs-dist/build/pdf.worker.min.js';
import { settings } from 'carbon-components';
import PdfViewerTextLayer, { PdfRenderedText } from './PdfViewerTextLayer';
import useAsyncFunctionCall from './useAsyncFunctionCall';

setupPdfjs();

interface Props {
  className?: string;

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
   * Render text layer
   */
  showTextLayer?: boolean;

  /**
   * Text layer class name. Only applicable when showTextLayer is true
   */
  textLayerClassName?: string;

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
  /**
   * Callback for text layer info
   */
  setRenderedText?: (info: PdfRenderedText | null) => any;
}

const PdfViewer: FC<Props> = ({
  className,
  file,
  page,
  scale,
  showTextLayer,
  textLayerClassName,
  setPageCount,
  setLoading,
  setHideToolbarControls,
  setRenderedText,
  children
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadedFile = useAsyncFunctionCall(
    useCallback(async () => (file ? await _loadPdf(file) : null), [file])
  );
  const loadedPage = useAsyncFunctionCall(
    useCallback(
      async () => (loadedFile && page > 0 ? await _loadPage(loadedFile, page) : null),
      [loadedFile, page]
    )
  );

  const [viewport, canvasInfo] = useMemo(() => {
    const viewport = loadedPage?.getViewport({ scale });
    const canvasInfo = viewport ? getCanvasInfo(viewport) : undefined;
    return [viewport, canvasInfo];
  }, [loadedPage, scale]);

  // render page
  useAsyncFunctionCall(
    useCallback(
      async (abortSignal: AbortSignal) => {
        if (loadedPage && !(loadedPage as any).then && viewport && canvasInfo) {
          const task = _renderPage(loadedPage, canvasRef.current!, viewport, canvasInfo);
          abortSignal.addEventListener('abort', () => task?.cancel());
          await task?.promise;

          setLoading(false);
        }
      },
      [canvasInfo, loadedPage, setLoading, viewport]
    )
  );

  useEffect(() => {
    if (setPageCount && loadedFile) {
      setPageCount(loadedFile.numPages);
    }
  }, [loadedFile, setPageCount]);

  useEffect(() => {
    if (setHideToolbarControls) {
      setHideToolbarControls(false);
    }
  }, [setHideToolbarControls]);

  const classNameBase = `${settings.prefix}--document-preview-pdf-viewer`;
  return (
    <div className={cx(classNameBase, className)}>
      <canvas
        ref={canvasRef}
        className={`${classNameBase}--canvas`}
        style={{ width: `${canvasInfo?.width ?? 0}px`, height: `${canvasInfo?.height ?? 0}px` }}
        width={canvasInfo?.canvasWidth}
        height={canvasInfo?.canvasHeight}
      />
      {showTextLayer && (
        <PdfViewerTextLayer
          className={cx(`${classNameBase}--text`, textLayerClassName)}
          loadedPage={loadedPage}
          scale={scale}
          setRenderedText={setRenderedText}
        />
      )}
      {children}
    </div>
  );
};

PdfViewer.defaultProps = {
  page: 1,
  scale: 1
};

function _loadPdf(data: string): Promise<PDFDocumentProxy> {
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

export type PdfViewerProps = Props;
export default PdfViewer;
