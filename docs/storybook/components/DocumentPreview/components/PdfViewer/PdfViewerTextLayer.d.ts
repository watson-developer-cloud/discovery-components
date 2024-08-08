import { FC } from 'react';
import { TextContent, PDFPageProxy } from 'pdfjs-dist/types/src/display/api';
import { PageViewport } from 'pdfjs-dist/types/src/display/display_utils';
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
declare const PdfViewerTextLayer: FC<PdfViewerTextLayerProps>;
export default PdfViewerTextLayer;
