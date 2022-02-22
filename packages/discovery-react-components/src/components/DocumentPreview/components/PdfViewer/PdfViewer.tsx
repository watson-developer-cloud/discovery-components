import React, { FC, useEffect, useRef, useMemo, useCallback } from 'react';
import cx from 'classnames';
import PdfjsLib, { PDFDocumentProxy, PDFPageProxy, PDFPromise, PDFRenderTask } from 'pdfjs-dist';
import PdfjsWorkerAsText from 'pdfjs-dist/build/pdf.worker.min.js';
import { settings } from 'carbon-components';
import useAsyncFunctionCall from 'utils/useAsyncFunctionCall';
import { QueryResult } from 'ibm-watson/discovery/v2';
import { DocumentFile } from '../../types';
import { getTextMappings } from '../../utils/documentData';
import PdfViewerTextLayer, { PdfRenderedText } from './PdfViewerTextLayer';
import { toPDFSource } from './utils';
import { PdfDisplayProps } from './types';

setupPdfjs();

type Props = PdfDisplayProps & {
  className?: string;

  /**
   * PDF file data as a "binary" string (array buffer) or PDFSource
   */
  file: DocumentFile;

  /**
   * Optionally takes a query result document for page count calculation
   */
  document?: QueryResult | null;

  /**
   * Text layer class name
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
};

const PdfViewer: FC<Props> = ({
  className,
  file,
  page,
  scale,
  document,
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

  const canvasInfo = useMemo(() => getCanvasInfo(loadedPage, scale), [loadedPage, scale]);

  // render page
  useAsyncFunctionCall(
    useCallback(
      async (abortSignal: AbortSignal) => {
        if (loadedPage && !(loadedPage as any).then && canvasInfo) {
          const task = _renderPage(loadedPage, canvasRef.current!, canvasInfo);
          abortSignal.addEventListener('abort', () => task?.cancel());
          await task?.promise;

          setLoading(false);
        }
      },
      [canvasInfo, loadedPage, setLoading]
    )
  );

  const pageCount = usePageCount({ loadedFile, document });
  useEffect(() => {
    if (setPageCount && pageCount !== null) {
      setPageCount(pageCount);
    }
  }, [pageCount, setPageCount]);

  useEffect(() => {
    if (setHideToolbarControls) {
      setHideToolbarControls(false);
    }
  }, [setHideToolbarControls]);

  const base = `${settings.prefix}--document-preview-pdf-viewer`;
  return (
    <div className={cx(base, className)}>
      <div className={`${base}__wrapper`}>
        <canvas
          ref={canvasRef}
          className={`${base}__canvas`}
          style={{ width: `${canvasInfo?.width ?? 0}px`, height: `${canvasInfo?.height ?? 0}px` }}
          width={canvasInfo?.canvasWidth}
          height={canvasInfo?.canvasHeight}
        />
        <PdfViewerTextLayer
          className={cx(`${base}__text`, textLayerClassName)}
          loadedPage={loadedPage}
          scale={scale}
          setRenderedText={setRenderedText}
        />
        {children}
      </div>
    </div>
  );
};

PdfViewer.defaultProps = {
  page: 1,
  scale: 1
};

function usePageCount({
  loadedFile,
  document
}: {
  loadedFile?: PDFDocumentProxy | null;
  document?: QueryResult | null;
}): number | null {
  // page count from the structural data list
  const pageCountFromTextMappings = useMemo(() => {
    const mappings = getTextMappings(document);
    if (mappings) {
      const last = mappings.text_mappings.length - 1;
      return mappings?.text_mappings[last].page.page_number ?? 1;
    }
    return 0;
  }, [document]);

  // Pull total page count from either the PDF file or the structural
  // data list
  const pageCount = useMemo(() => {
    if (loadedFile && loadedFile.numPages > 0) {
      return loadedFile.numPages;
    } else if (pageCountFromTextMappings > 0) {
      return pageCountFromTextMappings;
    }
    return null;
  }, [loadedFile, pageCountFromTextMappings]);

  return pageCount;
}

function _loadPdf(data: DocumentFile): PDFPromise<PDFDocumentProxy> {
  const source = toPDFSource(data);
  return PdfjsLib.getDocument(source).promise;
}

function _loadPage(file: PDFDocumentProxy, page: number) {
  return file.getPage(page);
}

function _renderPage(
  pdfPage: PDFPageProxy,
  canvas: HTMLCanvasElement,
  canvasInfo: CanvasInfo
): PDFRenderTask | null {
  const canvasContext = canvas.getContext('2d');
  if (canvasContext) {
    return pdfPage.render({ canvasContext, viewport: canvasInfo.viewport });
  }
  return null;
}

// set up web worker for use by PDF.js library
// @see https://stackoverflow.com/a/6454685/908343
function setupPdfjs(): void {
  if (typeof Worker !== 'undefined') {
    const blob = new Blob([PdfjsWorkerAsText], { type: 'text/javascript' });
    const pdfjsWorker = new Worker(URL.createObjectURL(blob)) as any;
    // @ts-expect-error Upgrading pdfjs-dist and its typings would resolve the issue
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
  viewport: PdfjsLib.PDFPageViewport;
};

function getCanvasInfo(
  loadedPage: PdfjsLib.PDFPageProxy | null | undefined,
  scale: number
): CanvasInfo | null {
  const canvasScale = window.devicePixelRatio ?? 1;
  const viewport = loadedPage?.getViewport({ scale: scale * canvasScale });
  if (viewport) {
    const { width: canvasWidth, height: canvasHeight } = viewport;
    const width = Math.ceil(canvasWidth / canvasScale);
    const height = Math.ceil(canvasHeight / canvasScale);
    return { width, height, canvasWidth, canvasHeight, viewport };
  }
  return null;
}

export type PdfViewerProps = Props;
export default PdfViewer;
