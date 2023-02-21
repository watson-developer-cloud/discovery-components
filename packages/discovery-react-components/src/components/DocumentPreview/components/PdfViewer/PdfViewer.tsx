import React, {
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
  HTMLAttributes
} from 'react';
import cx from 'classnames';
import * as PdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/display/api';
import { PageViewport } from 'pdfjs-dist/types/display/display_utils';
import { settings } from 'carbon-components';
import useSafeRef from 'utils/useSafeRef';
import useSize from 'utils/useSize';
import useAsyncFunctionCall from 'utils/useAsyncFunctionCall';
import setPdfJsGlobalWorkerOptions from 'utils/setPdfJsGlobalWorkerOptions';
import { QueryResult } from 'ibm-watson/discovery/v2';
import { DocumentFile } from '../../types';
import { getTextMappings } from '../../utils/documentData';
import PdfViewerTextLayer, { PdfRenderedText } from './PdfViewerTextLayer';
import { toPDFSource } from './utils';
import { PdfDisplayProps } from './types';
type RenderTask = ReturnType<PDFPageProxy['render']>;

export interface PdfViewerProps extends PdfDisplayProps, HTMLAttributes<HTMLElement> {
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
  /**
   * Callback any errors on render
   */
  setIsPdfRenderError?: (isError: boolean) => void;
  /**
   * URL of hosted PDF worker
   */
  pdfWorkerUrl?: string;
}

const PdfViewer = forwardRef<any, PdfViewerProps>(
  (
    {
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
      setIsPdfRenderError,
      pdfWorkerUrl,
      children,
      ...rest
    },
    scrollRef
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { node: rootNode, setRef: setRootRef } = useSafeRef();
    useImperativeHandle(scrollRef, () => rootNode!, [rootNode]);
    const [canvasInfo, setCanvasInfo] = useState<CanvasInfo | null>(null);

    useEffect(() => {
      // If we're given a url for a pdf.js worker, set up that worker
      if (pdfWorkerUrl) {
        setupPdfjs(pdfWorkerUrl);
      }
    }, [pdfWorkerUrl]);

    const loadedFile = useAsyncFunctionCall(
      useCallback(async () => {
        try {
          var promise = file ? await _loadPdf(file) : null;
          return promise;
        } catch (error) {
          setIsPdfRenderError?.(true);
          console.error(`Failed to load pdf file: ${error}`);
          return null;
        }
      }, [file, setIsPdfRenderError])
    );
    const loadedPage = useAsyncFunctionCall(
      useCallback(async () => {
        try {
          return loadedFile && page > 0 ? await _loadPage(loadedFile, page) : null;
        } catch (error) {
          console.error(`Failed to load pdf page ${page}: ${error}`);
          return null;
        }
      }, [loadedFile, page])
    );

    const { width } = useSize(rootNode);

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
      <div ref={setRootRef} className={cx(base, className)} {...rest}>
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
  }
);

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

function _loadPdf(data: DocumentFile): Promise<PDFDocumentProxy> {
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
): RenderTask | null {
  const canvasContext = canvas.getContext('2d');
  if (canvasContext) {
    canvasContext.resetTransform();
    return pdfPage.render({ canvasContext, viewport: canvasInfo.viewport });
  }
  return null;
}

// Store the pdf.js worker url to prevent multiple loads of the worker
let currentPdfWorkerUrl: string | null = null;
function setupPdfjs(pdfWorkerUrl: string): void {
  // Only load the worker the first time the worker url is sent in
  // and don't load the worker in unit tests (see setupTests.ts)
  if (!!pdfWorkerUrl && pdfWorkerUrl !== currentPdfWorkerUrl && typeof Worker !== 'undefined') {
    const pdfjsWorker = new Worker(pdfWorkerUrl);
    setPdfJsGlobalWorkerOptions({ workerPort: pdfjsWorker });
    currentPdfWorkerUrl = pdfWorkerUrl;
  }
}

type CanvasInfo = {
  width: number;
  height: number;
  canvasWidth: number;
  canvasHeight: number;
  fitToWidthRatio: number;
  viewport: PageViewport;
};

function getCanvasInfo(
  loadedPage: PDFPageProxy | null | undefined,
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

export default PdfViewer;
