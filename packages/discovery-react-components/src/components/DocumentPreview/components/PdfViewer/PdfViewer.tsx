import React, { FC, useEffect, useRef, useCallback, useMemo, useState, RefObject } from 'react';
import cx from 'classnames';
import PdfjsLib, { PDFDocumentProxy, PDFPageProxy, PDFPromise, PDFRenderTask } from 'pdfjs-dist';
import PdfjsWorkerAsText from 'pdfjs-dist/build/pdf.worker.min.js';
import { settings } from 'carbon-components';
import debounce from 'lodash/debounce';
import useResizeObserver from '@react-hook/resize-observer';
import useAsyncFunctionCall from 'utils/useAsyncFunctionCall';
import { QueryResult } from 'ibm-watson/discovery/v2';
import { DocumentFile } from '../../types';
import { getTextMappings } from '../../utils/documentData';
import PdfViewerTextLayer, { PdfRenderedText } from './PdfViewerTextLayer';
import { toPDFSource } from './utils';
import { PdfDisplayProps } from './types';

const RESIZE_DEBOUNCE = 50;

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
  const [previousRootWidth, setPreviousRootWidth] = useState<number>(0);

  const loadedFile = useAsyncFunctionCall(
    useCallback(async () => (file ? await _loadPdf(file) : null), [file])
  );
  const loadedPage = useAsyncFunctionCall(
    useCallback(
      async () => (loadedFile && page > 0 ? await _loadPage(loadedFile, page) : null),
      [loadedFile, page]
    )
  );

  useEffect(
    () => setCanvasInfo(getCanvasInfo(loadedPage, scale, rootRef)),
    [loadedPage, scale, rootRef]
  );

  useResizeObserver(
    rootRef.current,
    debounce(() => {
      const currentRootWidth = rootRef?.current?.getBoundingClientRect().width;
      if (!!currentRootWidth && currentRootWidth !== previousRootWidth) {
        setCanvasInfo(getCanvasInfo(loadedPage, scale, rootRef));
        setPreviousRootWidth(currentRootWidth);
      }
    }, RESIZE_DEBOUNCE)
  );

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

  const proportion = canvasInfo?.proportion || 1;

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
            scale={scale * proportion}
            setRenderedText={setRenderedText}
          />
        )}
        {typeof children === 'function' ? children({ proportion }) : children}
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
  proportion: number;
  viewport: PdfjsLib.PDFPageViewport;
};

function getCanvasInfo(
  loadedPage: PdfjsLib.PDFPageProxy | null | undefined,
  scale: number,
  rootRef: RefObject<HTMLDivElement>
): CanvasInfo | null {
  const rootDimensions = rootRef?.current?.getBoundingClientRect();
  if (loadedPage && rootDimensions) {
    const canvasScale = window.devicePixelRatio ?? 1;
    const width = rootDimensions.width * scale;
    const pageWidth = loadedPage.view[2];
    const proportion = rootDimensions.width / pageWidth;

    const viewport = loadedPage.getViewport({
      scale: (scale * canvasScale * width) / pageWidth
    });
    const { width: canvasWidth, height: canvasHeight } = viewport;
    const height = (width * canvasHeight) / canvasWidth;
    return { width, height, canvasWidth, canvasHeight, proportion, viewport };
  }
  return null;
}

export type PdfViewerProps = Props;
export default PdfViewer;
