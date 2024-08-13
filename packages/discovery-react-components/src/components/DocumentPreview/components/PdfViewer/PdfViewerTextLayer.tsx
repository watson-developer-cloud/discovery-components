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
  textDivs: HTMLCollection | Element[];

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
          let textDivs!: HTMLCollection | Element[];

          const builder = new TextLayerBuilder({
            pdfPage: loadedPage,
            // @ts-expect-error: type for `onAppend` is `null | undefined` for some reason, even though we know it can be used
            onAppend: (textLayerDiv: HTMLElement) => {
              // onAppend runs as part of the text layer rendering. We can use this to extract the rendered text divs and
              // do manual adjustment of their dimensions
              textLayerWrapper.append(textLayerDiv);
              textDivs = textLayerDiv.children;
              const textContentItems = textContent.items as TextItem[];
              if (textDivs?.length > 0 && textContentItems?.length > 0) {
                const [normalizedTextDivs, normalizedTextContentItems] = normalize(
                  textDivs,
                  textContentItems
                );
                adjustTextDivs(normalizedTextDivs, normalizedTextContentItems, scale);

                // update values that will be returned, to use normalized values
                textDivs = normalizedTextDivs;
                textContent.items = normalizedTextContentItems;
              }
            }
          });

          signal.addEventListener('abort', () => builder.cancel());

          textLayerWrapper.innerHTML = '';
          // `render()` will call `onAppend()` callback above before resolving its promise
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
 * We need `textDivs` collection to be in sync with `textContentItems`. The DOM
 * collection `textDivs` will contain both text spans and line breaks (`<br>`).
 * Normally, PDF.js' `getTextContent()` function will return an item that
 * corresponds to line breaks -- it will have no width/height and contain an
 * empty string. But this doesn't _always_ happen, resulting in a mismatch
 * between the two collections.
 *
 * This function removes line break elements (from `textDivs`) and any empty/
 * no-dimension items (from `textContentItems`) in order to ensure that the
 * collections are in sync.
 */
function normalize(
  textDivs: HTMLCollection,
  textContentItems: TextItem[]
): [Element[], TextItem[]] {
  const normalizedTextDivs = Array.from(textDivs).filter(elem => elem.tagName !== 'BR');
  const normalizedTextContentItems = textContentItems.filter(
    item => !(item.str.length === 0 && item.width === 0 && item.height === 0)
  );
  return [normalizedTextDivs, normalizedTextContentItems];
}

/**
 * Adjust text span dimensions based on scale
 */
function adjustTextDivs(textDivs: Element[], textItems: TextItem[] | null, scale: number): void {
  const scaleXPattern = /scaleX\(([\d.]+)\)/;
  const scaleYPattern = /scaleY\(([\d.]+)\)/;

  for (let index = 0; index < textDivs.length; index++) {
    const textDivElm = textDivs[index] as HTMLElement;
    const textItem = textItems?.[index];
    if (!textItem) return;

    const expectedWidth = textItem.width * scale;
    const actualWidth = textDivElm.getBoundingClientRect().width;
    const expectedHeight = textItem.height * scale;
    const actualHeight = textDivElm.getBoundingClientRect().height;

    // hide elements that don't have dimensions
    if (expectedHeight === 0 || expectedWidth === 0) {
      textDivElm.style.visibility = 'hidden';
      textDivElm.style.transform = '';
      continue;
    }

    // retrieve scale definition from within `transform` style rule
    function getScale(element: HTMLElement, type: 'x' | 'y'): number | null {
      const pattern = type === 'x' ? scaleXPattern : scaleYPattern;
      const match = element.style.transform?.match(pattern);
      if (match) {
        return parseFloat(match[1]);
      }
      return null;
    }

    const currentScaleX = getScale(textDivElm, 'x');
    if (currentScaleX && !isNaN(currentScaleX)) {
      const newScale = `scaleX(${(expectedWidth / actualWidth) * currentScaleX})`;
      textDivElm.style.transform = textDivElm.style.transform.replace(scaleXPattern, newScale);
    } else {
      const val = expectedWidth / actualWidth;
      if (val !== 0) {
        const newScale = `scaleX(${val})`;
        textDivElm.style.transform += newScale;
      }
    }

    const currentScaleY = getScale(textDivElm, 'y');
    if (currentScaleY && !isNaN(currentScaleY)) {
      const newScale = `scaleY(${(expectedHeight / actualHeight) * currentScaleY})`;
      textDivElm.style.transform = textDivElm.style.transform.replace(scaleYPattern, newScale);
    } else {
      const val = expectedHeight / actualHeight;
      if (val !== 0) {
        const newScale = `scaleY(${val})`;
        textDivElm.style.transform += newScale;
      }
    }
  }
}

export default PdfViewerTextLayer;
