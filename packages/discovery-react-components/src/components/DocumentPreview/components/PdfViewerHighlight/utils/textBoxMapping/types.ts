import { TextSpan } from '../../types';
import { TextLayoutCell, TextLayoutCellBase } from '../textLayout/types';

export type TextBoxMappingResult = {
  cell: TextLayoutCellBase | null;
  sourceSpan: TextSpan;
}[];

export interface TextBoxMapping {
  apply(source: TextLayoutCellBase, span?: TextSpan): TextBoxMappingResult;
}

export interface TextBoxMappingEntry {
  text: { cell: TextLayoutCell; span: TextSpan };
  box: { cell: TextLayoutCellBase } | null;
}
