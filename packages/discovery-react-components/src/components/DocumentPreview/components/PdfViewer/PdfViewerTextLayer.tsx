import { FC, useEffect, useRef, useCallback } from 'react';
import cx from 'classnames';
import { TextContent, TextItem, PDFPageProxy } from 'pdfjs-dist/types/src/display/api';
import { PageViewport } from 'pdfjs-dist/types/src/display/display_utils';
import { TextLayerBuilder } from 'pdfjs-dist/web/pdf_viewer.mjs';
import useAsyncFunctionCall from 'utils/useAsyncFunctionCall';
import { PdfDisplayProps } from './types';

type PdfViewerTextLayerProps = Pick<PdfDisplayProps, 'scale'> & {
  className?: string;

  /**
   * PDF page from pdfjs
   */
  loadedPage: PDFPageProxy | null | undefined;

  /**
   * Callback for text layer info
   */
  setRenderedText?: (info: PdfRenderedText | null) => any;
};

export type PdfRenderedText = {
  /**
   * PDF text content
   */
  textContent: TextContent;

  /**
   * Text span DOM elements rendered on the text layer
   */
  textDivs: HTMLCollection;

  /**
   * Pdf page viewport used to render text items
   */
  viewport: PageViewport;

  /**
   * Page number, starting at 1
   */
  page: number;
};

const PdfViewerTextLayer: FC<PdfViewerTextLayerProps> = ({
  className,
  loadedPage,
  scale = 1,
  setRenderedText = () => {}
}) => {
  const textLayerRef = useRef<HTMLDivElement>(null);
  const textLayerWrapper = textLayerRef.current;

  // load text content from the page
  const loadedText = useAsyncFunctionCall(
    useCallback(async () => {
      if (loadedPage) {
        const viewport = loadedPage.getViewport({ scale });
        const textContent = await loadedPage.getTextContent();
        return { textContent, viewport, page: loadedPage.pageNumber, scale };
      }
      return null;
    }, [loadedPage, scale])
  );

  // render text content
  const renderedText = useAsyncFunctionCall(
    useCallback(
      async (signal: AbortSignal) => {
        if (textLayerWrapper && loadedText) {
          const { textContent, viewport, page } = loadedText;
          let textDivs: HTMLCollection;

          const builder = new TextLayerBuilder({
            pdfPage: loadedPage,
            // @ts-expect-error: type for `onAppend` is `null | undefined` for some reason, even though we know it can be used
            onAppend: (textLayerDiv: HTMLElement) => {
              // onAppend runs as part of the text layer rendering. We can use this to extract the rendered text divs and
              // do manual adjustment of their dimensions
              textLayerWrapper.append(textLayerDiv);
              textDivs = textLayerDiv.children;
              const textContentItems = textContent.items as TextItem[];
              textDivs?.length > 0 &&
                textContentItems?.length > 0 &&
                _adjustTextDivs(textDivs, textContentItems, scale);
            }
          });

          signal.addEventListener('abort', () => builder.cancel());

          textLayerWrapper.innerHTML = '';
          await builder.render(viewport, textContent);
          return { textContent, viewport, page, textDivs };
        }
        return undefined;
      },
      [loadedPage, loadedText, scale, textLayerWrapper]
    )
  );

  useEffect(() => {
    if (renderedText !== undefined) {
      setRenderedText(renderedText);
    }
  }, [renderedText, setRenderedText]);

  return (
    <div
      className={cx(className, 'textLayerWrapper')}
      ref={textLayerRef}
      style={{
        width: `${loadedText?.viewport?.width ?? 0}px`,
        height: `${loadedText?.viewport?.height ?? 0}px`
      }}
    />
  );
};

/**
 * Adjust text span width based on scale
 * @param textDivs
 * @param textItems
 * @param scale
 */
function _adjustTextDivs(
  textDivs: HTMLCollection,
  textItems: TextItem[] | null,
  scale: number
): void {
  const scaleXPattern = /scaleX\(([\d.]+)\)/;
  const scaleYPattern = /scaleY\(([\d.]+)\)/;
  // since textDivs is technically not an array, just array-like, it doesn't have forEach
  [...textDivs].forEach((_textDivElm, index) => {
    const textDivElm = _textDivElm as HTMLElement;
    const textItem = textItems?.[index];
    if (!textItem) return;

    function getCurrentScales(element: HTMLElement) {
      const matchX = element.style.transform?.match(scaleXPattern);
      const matchY = element.style.transform?.match(scaleYPattern);
      const scaleX = !!matchX ? parseFloat(matchX[1]) : null;
      const scaleY = !!matchY ? parseFloat(matchY[1]) : null;
      return [scaleX, scaleY];
    }

    function getUpdatedScale(
      currentScale: number | null,
      expectedSize: number,
      actualSize: number
    ) {
      if (currentScale && !isNaN(currentScale)) {
        return `${(expectedSize / actualSize) * currentScale}`;
      } else {
        return `${expectedSize / actualSize}`;
      }
    }

    // adjust X and Y scale used in the transform
    const expectedWidth = textItem.width * scale;
    const actualWidth = textDivElm.getBoundingClientRect().width;
    const expectedHeight = textItem.height * scale;
    const actualHeight = textDivElm.getBoundingClientRect().height;
    const [currentScaleX, currentScaleY] = getCurrentScales(textDivElm);
    const updatedScaleX = getUpdatedScale(currentScaleX, expectedWidth, actualWidth);
    const updatedScaleY = getUpdatedScale(currentScaleY, expectedHeight, actualHeight);
    const newTransform = `scaleX(${updatedScaleX}) scaleY(${updatedScaleY})`;

    textDivElm.style.transform = newTransform;

    // adjust position from top
    const initialTop = textDivElm.style.top;
    const rescaledTop =
      initialTop.length > 0 &&
      Number.parseFloat(initialTop.substring(0, initialTop.length - 1)) / 2;
    if (!!rescaledTop) {
      textDivElm.style.top = rescaledTop.toString() + '%';
    }
  });
}

export default PdfViewerTextLayer;
