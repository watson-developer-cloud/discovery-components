import { TextContent } from 'pdfjs-dist/types/src/display/api';
import { PageViewport } from 'pdfjs-dist/types/src/display/display_utils';
import { DocumentFields, HighlightShape } from '../types';
import { DocumentFieldHighlight, TextMappings } from 'components/DocumentPreview/types';
import { HtmlBboxInfo } from './textLayout/types';
/**
 * Highlighter - calculate highlight bbox from spans on text fields
 */
export declare class Highlighter {
    readonly pageNum: number;
    private readonly textMappingsLayout;
    private pdfTextContentLayout;
    private textToHtmlBboxMappings;
    private textToPdfTextItemMappings;
    constructor({ document, textMappings, pageNum, htmlBboxInfo, pdfTextContentInfo }: {
        document: DocumentFields;
        textMappings: TextMappings;
        pageNum: number;
        htmlBboxInfo?: HtmlBboxInfo;
        pdfTextContentInfo?: {
            textContent: TextContent;
            viewport: PageViewport;
            spans?: HTMLCollection;
        };
    });
    /**
     * Update highlight with bboxes in HTML field in document
     * @param htmlBoxInfo processed document info including bboxes
     */
    setHtmlBboxInfo(htmlBoxInfo: HtmlBboxInfo): void;
    /**
     * Update highlighter with PDF text content
     * @param textContent PDF text content of the current page
     * @param viewport viewport of the currently rendered PDF page
     * @param textContentDivs HTML elements where text content items are rendered
     * @param htmlBoxInfo processed document info including bboxes
     */
    setTextContentItems(textContent: TextContent, viewport: PageViewport, textContentDivs?: HTMLCollection, htmlBoxInfo?: HtmlBboxInfo): void;
    /**
     * Update text content HTML elements
     * @param textContentDivs HTML elements where text content items are rendered
     */
    setTextContentDivs(textContentDivs?: HTMLCollection): void;
    /**
     * Get highlight shape from a span on a field
     * @param highlight a span on a document field to highlight
     * @returns highlight shape
     */
    getHighlight<T extends DocumentFieldHighlight = DocumentFieldHighlight>(highlight: T): HighlightShape & Omit<T, keyof DocumentFieldHighlight>;
    /**
     * Get text layout cells from a span on a field
     * @param highlight a span on a document field to highlight
     * @returns TextLayoutCells representing the given highlight
     */
    private getHighlightTextMappingResult;
    /**
     * Optimize highlight boxes by merging boxes next to each other
     */
    private static optimizeHighlightBoxes;
    /**
     * Generate highlight id
     */
    private static getId;
}
