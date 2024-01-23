import { TextLayout, TextLayoutCell } from '../textLayout/types';
import { TextBoxMapping } from './types';
/**
 * Calculate text box mapping from `source` text layout to `target` text layout
 * @param source text layout with larger cells
 * @param target text layout with smaller cells
 * @returns a text box mapping instance
 */
export declare function getTextBoxMappings<SourceCell extends TextLayoutCell, TargetCell extends TextLayoutCell>(sourceLayout: TextLayout<SourceCell>, targetLayout: TextLayout<TargetCell>): TextBoxMapping;
