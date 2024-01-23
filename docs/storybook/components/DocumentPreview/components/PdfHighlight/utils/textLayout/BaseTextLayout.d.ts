import { Bbox, TextSpan } from '../../types';
import { TextLayout, TextLayoutCell, TextLayoutCellBase } from './types';
/**
 * Base implementation of text layout cell
 */
export declare class BaseTextLayoutCell<Layout extends TextLayout<TextLayoutCell>> implements TextLayoutCell {
    readonly parent: Layout;
    readonly id: number;
    readonly pageNum: number;
    readonly bbox: Bbox;
    readonly text: string;
    constructor({ parent, id, pageNum, bbox, text }: {
        parent: Layout;
        id: number;
        pageNum: number;
        bbox: Bbox;
        text: string;
    });
    /**
     * @inheritdoc
     */
    getPartial(span: TextSpan): TextLayoutCellBase;
    /**
     * @inheritdoc
     */
    getNormalized(): {
        cell: TextLayoutCell;
        span?: TextSpan;
    };
    /**
     * @inheritdoc
     */
    getBboxForTextSpan(span: TextSpan, options: {
        useRatio?: boolean;
    }): Bbox | null;
    /**
     * @inheritdoc
     */
    trim(): TextLayoutCellBase;
}
/**
 * Text span on a base text layout cell
 */
export declare class PartialTextLayoutCell implements TextLayoutCellBase {
    readonly base: TextLayoutCell;
    readonly span: TextSpan;
    constructor(base: TextLayoutCell, span: TextSpan);
    get text(): string;
    /**
     * @inheritdoc
     */
    getPartial(span: TextSpan): TextLayoutCellBase;
    /**
     * @inheritdoc
     */
    getNormalized(): {
        cell: TextLayoutCell<number>;
        span: import("../../../../types").TextSpan;
    };
    /**
     * @inheritdoc
     */
    trim(): TextLayoutCellBase;
}
