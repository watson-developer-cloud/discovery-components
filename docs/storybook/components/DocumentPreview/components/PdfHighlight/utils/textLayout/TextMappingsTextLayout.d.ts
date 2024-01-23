import { Cell, CellField, DocumentFieldHighlight } from '../../../../types';
import { DocumentFields } from '../../types';
import { TextBoxMappingResult } from '../textBoxMapping/types';
import { BaseTextLayoutCell } from './BaseTextLayout';
import { TextLayout, TextMappingInfo } from './types';
/**
 * Text layout based on text mappings
 */
export declare class TextMappingsTextLayout implements TextLayout<TextMappingsTextLayoutCell> {
    readonly cells: TextMappingsTextLayoutCell[];
    constructor(textMappingInfo: TextMappingInfo, pageNum: number);
    /**
     * @inheritdoc
     */
    cellAt(id: number): TextMappingsTextLayoutCell;
    /**
     * Get highlighted text layout cells from a span on a field in a search result document
     * @param highlight field and span to highlight
     * @returns a text cell based on
     */
    getHighlight(highlight: DocumentFieldHighlight): TextBoxMappingResult;
}
/**
 * Text layout cell based on a text mapping cell
 */
declare class TextMappingsTextLayoutCell extends BaseTextLayoutCell<TextMappingsTextLayout> {
    readonly cellField: CellField;
    constructor(parent: TextMappingsTextLayout, index: number, document: DocumentFields, cell: Cell);
}
export {};
