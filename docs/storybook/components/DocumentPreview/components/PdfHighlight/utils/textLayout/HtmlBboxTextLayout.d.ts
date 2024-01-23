import { ProcessedBbox } from 'utils/document';
import { Bbox, TextSpan } from '../../types';
import { BaseTextLayoutCell } from './BaseTextLayout';
import { HtmlBboxInfo, TextLayout } from './types';
/**
 * Text layout based on bboxes in HTML field
 */
export declare class HtmlBboxTextLayout implements TextLayout<HtmlBboxTextLayoutCell> {
    private readonly bboxInfo;
    readonly cells: HtmlBboxTextLayoutCell[];
    constructor(bboxInfo: HtmlBboxInfo, pageNum: number);
    /**
     * @inheritdoc
     */
    cellAt(id: number): HtmlBboxTextLayoutCell;
    /**
     * Install style to DOM if not yet. The style will be used to calculate bbox in `getBboxForTextSpan`
     */
    installStyle(): void;
}
/**
 * Text layout cell based on bboxes in HTML field
 */
declare class HtmlBboxTextLayoutCell extends BaseTextLayoutCell<HtmlBboxTextLayout> {
    private readonly processedBbox;
    constructor(parent: HtmlBboxTextLayout, index: number, processedBbox: ProcessedBbox);
    /**
     * @inheritdoc
     */
    getBboxForTextSpan(span: TextSpan, options: {
        useRatio?: boolean;
    }): Bbox | null;
}
export {};
