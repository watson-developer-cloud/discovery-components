import { TextItem } from 'pdfjs-dist/types/src/display/api';
import { PageViewport } from 'pdfjs-dist/types/src/display/display_utils';
import { Bbox, TextSpan } from '../../types';
import { BaseTextLayoutCell } from './BaseTextLayout';
import { HtmlBboxInfo, PdfTextContentInfo, TextLayout } from './types';
/**
 * Text layout based on PDF text objects
 */
export declare class PdfTextContentTextLayout implements TextLayout<PdfTextContentTextLayoutCell> {
    private readonly textContentInfo;
    readonly cells: PdfTextContentTextLayoutCell[];
    private divs;
    constructor(textContentInfo: PdfTextContentInfo, pageNum: number, htmlBboxInfo?: HtmlBboxInfo);
    /**
     * get viewport of the current page
     */
    get viewport(): PageViewport;
    /**
     * @inheritdoc
     */
    cellAt(id: number): PdfTextContentTextLayoutCell;
    /**
     * set PDF text content item divs
     */
    setDivs(divs: HTMLCollection | undefined): void;
    /**
     * get HTML element for a given cell id
     */
    divAt(id: number): HTMLElement | undefined;
}
/**
 * Text layout cell based on PDF text objects
 */
declare class PdfTextContentTextLayoutCell extends BaseTextLayoutCell<PdfTextContentTextLayout> {
    /**
     * @inheritdoc
     */
    readonly isInHtmlBbox?: boolean;
    constructor(parent: PdfTextContentTextLayout, index: number, textItem: TextItem, pageNum: number, bbox: Bbox, isInHtmlBbox: boolean);
    /**
     * @inheritdoc
     */
    getBboxForTextSpan(span: TextSpan, options: {
        useRatio?: boolean;
    }): Bbox | null;
}
export {};
