import { TextSpan } from '../../types';
import { TextBoxMapping, TextBoxMappingEntry, TextBoxMappingResult } from './types';
import { Dictionary } from 'lodash';
import groupBy from 'lodash/groupBy';
import {
  spanCompare,
  spanFromSubSpan,
  spanGetSubSpan,
  spanIntersection,
  spanIntersects
} from '../common/textSpanUtils';
import { TextLayoutCell, TextLayoutCellBase } from '../textLayout/types';
import { TextNormalizer } from '../common/TextNormalizer';

const debugOut = require('debug')?.('pdf:mapping:TextBoxMappingImpl');
function debug(...args: any) {
  debugOut?.apply(null, args);
}

export class TextBoxMappingImpl implements TextBoxMapping {
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

  getEntries(sourceCell: TextLayoutCell, spanInSourceCell: TextSpan) {
    return (this.mappingEntryMap[sourceCell.id] || []).filter(m =>
      spanIntersects(m.text.span, spanInSourceCell)
    );
  }

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
        if (hasSameText(m.text.cell, m.text.span, source, spanInSourceCell)) {
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

function hasSameText(
  textCell: TextLayoutCellBase,
  textSpan: TextSpan,
  sourceCell: TextLayoutCellBase,
  sourceSpan: TextSpan
) {
  const left = textCell.text.substring(...textSpan);
  const right = sourceCell.text.substring(...sourceSpan);
  return left === right;
}
