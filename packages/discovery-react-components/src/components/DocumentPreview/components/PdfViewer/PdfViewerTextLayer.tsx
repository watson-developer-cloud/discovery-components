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
  textDivs: HTMLElement[];

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
          let textDivs: HTMLElement[] = [];
          // const textAccessibilityManager = new TextAccessibilityManager();

          const builder = new TextLayerBuilder({
            pdfPage: loadedPage,
            // @ts-expect-error: type for this param is null | undefined for some reason, even though we know it can be used
            onAppend: textLayerDiv => {
              textLayerWrapper.append(textLayerDiv);
              textDivs = textLayerDiv.children;
              const textContentItems = textContent.items as TextItem[];
              // console.log('div children', textLayerDiv.children); // includes end of content
              console.log('textDivs', textDivs);
              console.log('scale', scale);
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
  textDivs: HTMLElement[],
  textItems: TextItem[] | null,
  scale: number
): void {
  const scaleXPattern = /scaleX\(([\d.]+)\)/;
  // since textDivs is technically not an array, just array-like, it doesn't have forEach
  [...textDivs].forEach((textDivElm, index) => {
    const textItem = textItems?.[index];
    if (!textItem) return;

    const expectedWidth = textItem.width * scale;
    const actualWidth = textDivElm.getBoundingClientRect().width;

    function getScaleX(element: HTMLElement) {
      const match = element.style.transform?.match(scaleXPattern);
      if (match) {
        return parseFloat(match[1]);
      }
      return null;
    }
    const currentScaleX = getScaleX(textDivElm);
    if (currentScaleX && !isNaN(currentScaleX)) {
      const newScale = `scaleX(${(expectedWidth / actualWidth) * currentScaleX})`;
      textDivElm.style.transform = textDivElm.style.transform.replace(scaleXPattern, newScale);
    } else {
      const newScale = `scaleX(${expectedWidth / actualWidth})`;
      textDivElm.style.transform = newScale;
    }

    const initialTop = textDivElm.style.top;
    const rescaledTop =
      initialTop.length > 0 &&
      Number.parseFloat(initialTop.substring(0, initialTop.length - 1)) / 2;
    console.log('initialTop', textDivElm.style.top, 'rescaledTop', rescaledTop);
    if (!!rescaledTop) {
      textDivElm.style.top = rescaledTop.toString() + '%';
    }
  });
}

export default PdfViewerTextLayer;
