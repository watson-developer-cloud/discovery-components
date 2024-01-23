import { TextSpan } from '../../types';
import { TextLayoutCellBase } from '../textLayout/types';
import { TextBoxMapping, TextBoxMappingEntry, TextBoxMappingResult } from './types';
/**
 * Text box mapping. Mapping between cells (i.e. text box) in a TextLayout
 * to ones in another TextLayout.
 */
declare class TextBoxMappingImpl implements TextBoxMapping {
    private readonly mappingEntryMap;
    constructor(mappingEntries: TextBoxMappingEntry[]);
    /**
     * get text mapping entries for a given span `spanInSourceCell` on a given `sourceCell`
     */
    private getEntries;
    /**
     * @inheritdoc
     */
    apply(source: TextLayoutCellBase, aSpan?: TextSpan): TextBoxMappingResult;
}
/**
 * Builder for the TextMapping
 */
export declare class TextBoxMappingBuilder {
    mappingEntries: TextBoxMappingEntry[];
    /**
     * add new mapping data
     */
    addMapping(text: TextBoxMappingEntry['text'], box: TextBoxMappingEntry['box']): void;
    toTextBoxMapping(): TextBoxMappingImpl;
}
export {};
