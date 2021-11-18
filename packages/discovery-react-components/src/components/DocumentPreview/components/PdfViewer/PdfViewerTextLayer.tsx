import React, { FC, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import PDFJSLib, { PDFPageProxy, PDFPageViewport, TextContent, TextContentItem } from 'pdfjs-dist';
import { EventBus } from 'pdfjs-dist/lib/web/ui_utils';
import { TextLayerBuilder } from 'pdfjs-dist/lib/web/text_layer_builder';

const { RenderingCancelledException } = PDFJSLib as any;

interface Props {
  className?: string;

  /**
   * PDF page from pdfjs
   */
  loadedPage: PDFPageProxy | null | undefined;

  /**
   * Zoom factor, where `1` is equal to 100%
   */
  scale: number;

  /**
   * Callback for text layer info
   */
  setTextLayerInfo?: (info: PdfTextLayerInfo | null) => any;
}

export type PdfTextLayerInfo = {
  /**
   * PDF text content
   */
  textContent: TextContent & {
    styles: { [styleName: string]: CSSStyleDeclaration };
  };

  /**
   * Text span DOM elements rendered on the text layer
   */
  textDivs: HTMLElement[];

  /**
   * Pdf page viewport used to render text items
   */
  viewport: PDFPageViewport;

  /**
   * Page number, starting at 1
   */
  page: number;
};

type PdfTextContentInfo = {
  /** extracted PDF text content */
  textContent: TextContent;

  /** @see Props['scale'] */
  scale: number;

  /** @see PdfTextLayerInfo['viewport'] */
  viewport: PDFPageViewport;

  /** @see PdfTextLayerInfo['page'] */
  page: number;
};

const PdfViewerTextLayer: FC<Props> = ({
  className,
  loadedPage,
  scale = 1,
  setTextLayerInfo: setTextLayerInfoCallback = () => {}
}) => {
  const textLayerRef = useRef<HTMLDivElement>(null);
  const textLayerDiv = textLayerRef.current;

  // load text content from the page
  const [textContentInfo, setTextContentInfo] = useState<PdfTextContentInfo | null>(null);
  useEffect(() => {
    async function loadTextInfo() {
      if (loadedPage) {
        const viewport = loadedPage.getViewport({ scale });
        const textContent = await loadedPage.getTextContent();
        setTextContentInfo({ textContent, viewport, page: loadedPage.pageNumber, scale });
      }
    }
    loadTextInfo();
  }, [loadedPage, scale]);

  // render text content
  const [renderedTextInfo, setRenderedTextInfo] = useState<PdfTextLayerInfo | null>(null);
  useTextLayerRendering(textLayerDiv, textContentInfo, setRenderedTextInfo);

  useEffect(() => {
    setTextLayerInfoCallback(renderedTextInfo);
  }, [renderedTextInfo, setTextLayerInfoCallback]);

  const rootClassName = cx(className, `textLayer`);
  return (
    <div
      className={rootClassName}
      ref={textLayerRef}
      style={{
        width: `${textContentInfo?.viewport?.width ?? 0}px`,
        height: `${textContentInfo?.viewport?.height ?? 0}px`
      }}
    />
  );
};

function useTextLayerRendering(
  textLayerDiv: HTMLDivElement | null,
  textRenderInfo: PdfTextContentInfo | null,
  setRenderedTextInfo?: (info: PdfTextLayerInfo | null) => any
) {
  const textLayerBuilderRef = useRef<TextLayerBuilder | null>(null); // ref for debugging purpose
  // render text content
  useEffect(() => {
    let textLayerBuilder: TextLayerBuilder | null = null;
    async function loadTextLayer() {
      let textLayerInfo: PdfTextLayerInfo | null = null;

      if (textLayerDiv && textRenderInfo) {
        const { textContent, viewport, scale, page } = textRenderInfo;
        // prepare text layer
        textLayerBuilder = textLayerBuilderRef.current = new TextLayerBuilder({
          textLayerDiv,
          viewport,
          eventBus: new EventBus(),
          pageIndex: page - 1
        });
        textLayerBuilder.setTextContent(textContent);

        // render
        textLayerDiv.innerHTML = '';
        try {
          const deferredRenderEndPromise = new Promise(resolve => {
            const listener = () => {
              resolve(undefined);
              textLayerBuilder?.eventBus.off('textlayerrendered', listener);
            };
            textLayerBuilder?.eventBus.on('textlayerrendered', listener);
          });

          textLayerBuilder.render();
          await deferredRenderEndPromise;

          // fix text divs
          _adjustTextDivs(textLayerBuilder.textDivs, textContent.items, scale);

          textLayerInfo = {
            textContent,
            textDivs: textLayerBuilder.textDivs,
            viewport,
            page
          };
        } catch (e) {
          if (e instanceof RenderingCancelledException) {
            // Ignore. Rendering is interrupted by useEffect cleanup method.
            // Another rendering starts soon
            return;
          } else {
            throw e; // rethrow unknown exception
          }
        }
      }
      if (setRenderedTextInfo) {
        setRenderedTextInfo(textLayerInfo);
      }
    }

    loadTextLayer();

    return () => {
      textLayerBuilder?.cancel();
    };
  }, [setRenderedTextInfo, textLayerDiv, textRenderInfo]);
}

/**
 * Adjust text span width based on scale
 * @param textDivs
 * @param textItems
 * @param scale
 */
function _adjustTextDivs(
  textDivs: HTMLElement[],
  textItems: TextContentItem[] | null,
  scale: number
): void {
  const scaleXPattern = /scaleX\(([\d.]+)\)/;
  (textDivs || []).forEach((textDivElm, index) => {
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
  });
}

export default PdfViewerTextLayer;
