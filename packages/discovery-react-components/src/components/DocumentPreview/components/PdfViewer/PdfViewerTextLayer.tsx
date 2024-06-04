import { FC, useEffect, useRef, useCallback } from 'react';
import cx from 'classnames';
import { TextContent, PDFPageProxy } from 'pdfjs-dist/types/src/display/api';
import { PageViewport } from 'pdfjs-dist/types/src/display/display_utils';
import { TextLayerBuilder } from 'pdfjs-dist/web/pdf_viewer.mjs';
import { TextLayer as PdfJsTextLayer } from 'pdfjs-dist/build/pdf.mjs';
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

          const builder = new TextLayerBuilder({
            pdfPage: loadedPage
          });

          textLayerWrapper.append(builder.div);
          signal.addEventListener('abort', () => builder.cancel());

          await _renderTextLayer(builder, textLayerWrapper, viewport);
          //TODO: is textLayerWrapper the right value for the container?
          const pdfJsTextLayer = new PdfJsTextLayer({
            textContentSource: textContent,
            container: textLayerWrapper,
            viewport
          });
          await pdfJsTextLayer.render();
          return { textContent, viewport, page, textDivs: pdfJsTextLayer.textDivs };
        }
        return undefined;
      },
      [loadedPage, loadedText, textLayerWrapper]
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
 * Render text into DOM using the text layer builder
 */
async function _renderTextLayer(
  builder: TextLayerBuilder,
  // textContent: TextContent,
  textLayerDiv: HTMLDivElement,
  // scale: number,
  viewport: PageViewport
  // loadedPage: PDFPageProxy
) {
  // render
  textLayerDiv.innerHTML = '';
  // const deferredRenderEndPromise = new Promise<void>(resolve => {
  //   const listener = () => {
  //     resolve();
  //     builder?.eventBus.off('textlayerrendered', listener);
  //   };
  //   builder?.eventBus.on('textlayerrendered', listener);
  // });

  // TODO: if this method is only 2 commands, can we extract them to the component renderer above?
  await builder.render(viewport);

  // _adjustTextDivs(builder.textDivs, textContent.items as TextItem[], scale);
}

/**
 * Adjust text span width based on scale
 * @param textDivs
 * @param textItems
 * @param scale
 */
// function _adjustTextDivs(
//   textDivs: HTMLElement[],
//   textItems: TextItem[] | null,
//   scale: number
// ): void {
//   const scaleXPattern = /scaleX\(([\d.]+)\)/;
//   (textDivs || []).forEach((textDivElm, index) => {
//     const textItem = textItems?.[index];
//     if (!textItem) return;

//     const expectedWidth = textItem.width * scale;
//     const actualWidth = textDivElm.getBoundingClientRect().width;

//     function getScaleX(element: HTMLElement) {
//       const match = element.style.transform?.match(scaleXPattern);
//       if (match) {
//         return parseFloat(match[1]);
//       }
//       return null;
//     }
//     const currentScaleX = getScaleX(textDivElm);
//     if (currentScaleX && !isNaN(currentScaleX)) {
//       const newScale = `scaleX(${(expectedWidth / actualWidth) * currentScaleX})`;
//       textDivElm.style.transform = textDivElm.style.transform.replace(scaleXPattern, newScale);
//     } else {
//       const newScale = `scaleX(${expectedWidth / actualWidth})`;
//       textDivElm.style.transform = newScale;
//     }
//   });
// }

export default PdfViewerTextLayer;
