import { TextSpan } from '../../types';
import { TextLayoutCell, TextLayoutCellBase } from '../textLayout/types';

export type TextBoxMappingResult = {
  cell: TextLayoutCellBase | null;
  sourceSpan: TextSpan;
}[];

/**
 * Interface for text box mapping
 */
export interface TextBoxMapping {
  /**
   * Get spans on target (smaller) cells for a given span on a source (larger) cell
   * @param source source text layout cell
   * @param span span on the source cell
   */
  apply(source: TextLayoutCellBase, span?: TextSpan): TextBoxMappingResult;
}

/**
 * Interface for text box mapping entries.
 * Internal. Used only in text box mapping implementation
 */
export interface TextBoxMappingEntry {
  text: { cell: TextLayoutCell; span: TextSpan };
  box: { cell: TextLayoutCellBase } | null;
}
