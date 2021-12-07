import { Cell, CellField } from '../../../../types';
import {
  spanGetSubSpan,
  spanContains,
  spanIntersection,
  spanIntersects
} from '../../../../utils/textSpan';
import { DocumentFields, DocumentFieldHighlight, TextSpan } from '../../types';
import { getDocFieldValue } from '../common/documentUtils';
import { TextBoxMappingResult } from '../textBoxMapping/types';
import { BaseTextLayoutCell } from './BaseTextLayout';
import { TextLayout, TextMappingInfo } from './types';

/**
 * Text layout based on text mappings
 */
export class TextMappingsTextLayout implements TextLayout<TextMappingsTextLayoutCell> {
  readonly cells: TextMappingsTextLayoutCell[];

  constructor(textMappingInfo: TextMappingInfo, pageNum: number) {
    const { textMappings, document } = textMappingInfo;

    this.cells = textMappings.text_mappings
      .filter(cell => cell.page.page_number === pageNum)
      .map((cell, index) => {
        return new TextMappingsTextLayoutCell(this, index, document, cell);
      });
  }

  /**
   * @inheritdoc
   */
  cellAt(id: number) {
    return this.cells[id];
  }

  /**
   * Get highlighted text layout cells from a span on a field in a search result document
   * @param highlight field and span to highlight
   * @returns a text cell based on
   */
  getHighlight(highlight: DocumentFieldHighlight): TextBoxMappingResult {
    const highlightSpan: TextSpan = [highlight.location.begin, highlight.location.end];
    const highlightCells = this.cells
      .filter(cell => {
        const { cellField } = cell;
        return (
          cellField.name === highlight.field &&
          cellField.index === highlight.fieldIndex &&
          spanIntersects(cellField.span, highlightSpan)
        );
      })
      .map(cell => {
        const { cellField } = cell;
        const currentSpan = spanIntersection(cellField.span, highlightSpan);
        if (spanContains(highlightSpan, cellField.span)) {
          return { cell, sourceSpan: currentSpan };
        }
        const subSpan = spanGetSubSpan(cellField.span, currentSpan);
        return { cell: cell.getPartial(subSpan), sourceSpan: currentSpan };
      });
    return highlightCells;
  }
}

/**
 * Text layout cell based on a text mapping cell
 */
class TextMappingsTextLayoutCell extends BaseTextLayoutCell<TextMappingsTextLayout> {
  readonly cellField: CellField;

  constructor(parent: TextMappingsTextLayout, index: number, document: DocumentFields, cell: Cell) {
    const id = index;
    const pageNum = cell.page.page_number;
    const bbox = cell.page.bbox;
    const text =
      getDocFieldValue(document, cell.field.name, cell.field.index, cell.field.span) ?? '';
    super({ parent, id, pageNum, bbox, text });
    this.cellField = cell.field;
  }
}
