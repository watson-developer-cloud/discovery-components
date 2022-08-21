import React, { FC, useEffect, useRef, useCallback, useMemo, useState } from 'react';
import cx from 'classnames';
import PdfjsLib, { PDFDocumentProxy, PDFPageProxy, PDFPromise, PDFRenderTask } from 'pdfjs-dist';
import PdfjsWorkerAsText from 'pdfjs-dist/build/pdf.worker.min.js';
import { settings } from 'carbon-components';
import useSize from 'utils/useSize';
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
   * Disable the text layer overlay (defaults to `false`)
   */
  disableTextLayer?: boolean;

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
  disableTextLayer = false,
  setPageCount,
  setLoading,
  setHideToolbarControls,
  setRenderedText,
  children
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [canvasInfo, setCanvasInfo] = useState<CanvasInfo | null>(null);

  const loadedFile = useAsyncFunctionCall(
    useCallback(async () => (file ? await _loadPdf(file) : null), [file])
  );
  const loadedPage = useAsyncFunctionCall(
    useCallback(
      async () => (loadedFile && page > 0 ? await _loadPage(loadedFile, page) : null),
      [loadedFile, page]
    )
  );

  // Returns the width of the root ref in order to trigger resizing the canvas when this value changes
  const { width } = useSize(rootRef);

  useEffect(() => {
    // width has changed; update canvas info
    setCanvasInfo(getCanvasInfo(loadedPage, scale, width));
  }, [loadedPage, scale, width]);

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

  // Ratio of the available width for the viewer to the native width of the PDF
  // This value will be used to scale the text layer and highlights
  const fitToWidthRatio = canvasInfo?.fitToWidthRatio || 1;

  const base = `${settings.prefix}--document-preview-pdf-viewer`;
  return (
    <div ref={rootRef} className={cx(base, className)}>
      <div className={`${base}__wrapper`}>
        <canvas
          ref={canvasRef}
          className={`${base}__canvas`}
          style={{
            width: `${canvasInfo?.width ?? 0}px`,
            height: `${canvasInfo?.height ?? 0}px`
          }}
          width={canvasInfo?.canvasWidth}
          height={canvasInfo?.canvasHeight}
        />
        {!disableTextLayer && (
          <PdfViewerTextLayer
            className={cx(`${base}__text`, textLayerClassName)}
            loadedPage={loadedPage}
            scale={scale * fitToWidthRatio}
            setRenderedText={setRenderedText}
          />
        )}
        {typeof children === 'function' ? children({ fitToWidthRatio }) : children}
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
    canvasContext.resetTransform();
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
  fitToWidthRatio: number;
  viewport: PdfjsLib.PDFPageViewport;
};

function getCanvasInfo(
  loadedPage: PdfjsLib.PDFPageProxy | null | undefined,
  scale: number,
  rootWidth: number
): CanvasInfo | null {
  if (loadedPage) {
    // Set the displayed width of the canvas to fill the available width (from parent component)
    // when scale = 1, and to scale up or down accordingly with the scale value
    const width = rootWidth * scale;

    // The native width of the PDF page can be found by subtracting the x2 and x1 values
    // of the page view, which indicate the left and right edge of the page
    // @see https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-PDFPageProxy.html#view
    const pageWidth = loadedPage.view[2] - loadedPage.view[0];

    // Proportion of the display width to the native width of the PDF,
    // which will be used to scale the text layer and highlights
    const fitToWidthRatio = rootWidth / pageWidth;

    // Use the device's pixel ratio to adjust the canvas scale
    const devicePixelRatio = window.devicePixelRatio ?? 1;

    // Get the viewport of the page, scaled based on the current scale, fit-to-width ratio, and pixel ratio
    const viewport = loadedPage.getViewport({
      scale: scale * fitToWidthRatio * devicePixelRatio
    });

    // Pull the width and height of the viewport to be used when rendering the canvas element
    const { width: canvasWidth, height: canvasHeight } = viewport;

    // Height-to-width ratio of the PDF in the canvas
    const pageAspectRatio = canvasHeight / canvasWidth;

    // Set the displayed height of the canvas element based on the width and page aspect ratio
    const height = width * pageAspectRatio;

    return { width, height, canvasWidth, canvasHeight, fitToWidthRatio, viewport };
  }
  return null;
}

export type PdfViewerProps = Props;
export default PdfViewer;
