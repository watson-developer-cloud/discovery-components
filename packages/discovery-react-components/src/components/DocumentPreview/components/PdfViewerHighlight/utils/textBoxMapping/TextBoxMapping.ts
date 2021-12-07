import { Dictionary } from 'lodash';
import groupBy from 'lodash/groupBy';
import { TextSpan } from '../../types';
import {
  spanCompare,
  spanFromSubSpan,
  spanGetSubSpan,
  spanIntersection,
  spanIntersects
} from '../../../../utils/textSpan';
import { TextLayoutCell, TextLayoutCellBase } from '../textLayout/types';
import { TextNormalizer } from '../common/TextNormalizer';
import { TextBoxMapping, TextBoxMappingEntry, TextBoxMappingResult } from './types';

const debugOut = require('debug')?.('pdf:mapping:TextBoxMapping');
function debug(...args: any) {
  debugOut?.apply(null, args);
}

/**
 * Text box mapping. Mapping between cells (i.e. text box) in a TextLayout
 * to ones in another TextLayout.
 */
class TextBoxMappingImpl implements TextBoxMapping {
  private readonly mappingEntryMap: Dictionary<TextBoxMappingEntry[]>;

  constructor(mappingEntries: TextBoxMappingEntry[]) {
    this.mappingEntryMap = groupBy(mappingEntries, m => m.text.cell.id);

    // sort by span offset
    Object.values(this.mappingEntryMap).forEach(value => {
      value.sort((a, b) => spanCompare(a.text.span, b.text.span));
    });
    debug('TextBoxMapping created');
    debug(this);
  }

  /**
   * get text mapping entries for a given span `spanInSourceCell` on a given `sourceCell`
   */
  private getEntries(
    sourceCell: TextLayoutCell,
    spanOnSourceCell: TextSpan
  ): TextBoxMappingEntry[] {
    return (this.mappingEntryMap[sourceCell.id] || []).filter(m =>
      spanIntersects(m.text.span, spanOnSourceCell)
    );
  }

  /**
   * @inheritdoc
   */
  apply(source: TextLayoutCellBase, aSpan?: TextSpan): TextBoxMappingResult {
    const span: TextSpan = aSpan || [0, source.text.length];

    const { cell: sourceCell, span: sourceSpan } = source.getNormalized();
    const spanInSourceCell = sourceSpan ? spanFromSubSpan(sourceSpan, span) : span;

    debug('applying TextBoxMapping');
    debug(source, span);
    const entries = this.getEntries(sourceCell, spanInSourceCell);
    const result = entries.map(m => {
      if (!m.box) {
        return { cell: null, sourceSpan: m.text.span };
      } else {
        let boxSpan;
        if (equalsSpanText(m.text.cell, m.text.span, source, spanInSourceCell)) {
          boxSpan = spanGetSubSpan(m.text.span, spanInSourceCell);
        } else {
          const n1 = new TextNormalizer(m.text.cell.text);
          const normalizedBoxSpan = spanGetSubSpan(
            n1.toNormalized(m.text.span),
            n1.toNormalized(spanInSourceCell)
          );
          const n2 = new TextNormalizer(m.box.cell.text);
          boxSpan = n2.toRaw(normalizedBoxSpan);
        }

        return {
          cell: m.box.cell.getPartial(boxSpan),
          sourceSpan: spanIntersection(m.text.span, spanInSourceCell)
        };
      }
    });
    debug('applying TextBoxMapping - result');
    debug(result);
    return result;
  }
}

/**
 * Builder for the TextMapping
 */
export class TextBoxMappingBuilder {
  mappingEntries: TextBoxMappingEntry[] = [];

  /**
   * add new mapping data
   */
  addMapping(text: TextBoxMappingEntry['text'], box: TextBoxMappingEntry['box']) {
    this.mappingEntries.push({ text, box });
    debug('>> added a new mapping entry (%o) => (cell: %o)', text, text, box?.cell);
  }

  toTextBoxMapping() {
    return new TextBoxMappingImpl(this.mappingEntries);
  }
}

/**
 * Check if text on spans on cells are the same or not
 */
function equalsSpanText(
  textCell: TextLayoutCellBase,
  textSpan: TextSpan,
  sourceCell: TextLayoutCellBase,
  sourceSpan: TextSpan
) {
  const left = textCell.text.substring(...textSpan);
  const right = sourceCell.text.substring(...sourceSpan);
  return left === right;
}
