import minBy from 'lodash/minBy';
import { TextSpan } from '../../types';
import { bboxIntersects } from '../common/bboxUtils';
import { nonEmpty } from '../common/nonEmpty';
import { spanLen, spanUnion } from '../common/textSpanUtils';
import { TextLayout, TextLayoutCell, TextLayoutCellBase } from '../textLayout/types';
import { MappingSourceTextProvider } from './MappingSourceTextProvider';
import { MappingTargetBoxProvider } from './MappingTargetCellProvider';
import { TextBoxMappingImpl } from './TextBoxMapping';
import { TextBoxMappingEntry } from './types';

const debugOut = require('debug')?.('pdf:mapping:getTextBoxMapping');
function debug(...args: any) {
  debugOut?.apply(null, args);
}

function findMatchInSources(
  sources: {
    cell: TextLayoutCell;
    provider: MappingSourceTextProvider;
  }[],
  textToMatch: string
) {
  // find matches
  const matches = sources.map(source => {
    const match = source.provider.getMatch(textToMatch);
    return {
      cell: source.cell,
      provider: source.provider,
      match
    };
  });

  // calc cost for each match
  let skipTextLen = 0;
  const matchesWithCost = matches.map(aMatch => {
    const { match: providerMatch } = aMatch;
    const cost = !providerMatch
      ? Number.MAX_SAFE_INTEGER
      : skipTextLen + providerMatch.skipText.length - spanLen(providerMatch.span);

    skipTextLen += providerMatch?.approxLenAfterEnd ?? 0;

    return { ...aMatch, cost };
  });

  // find best match
  const bestMatch = minBy(matchesWithCost, match => match.cost);
  return bestMatch;
}

export function getTextBoxMappings<
  SourceCell extends TextLayoutCell,
  TargetCell extends TextLayoutCell
>(source: TextLayout<SourceCell>, target: TextLayout<TargetCell>) {
  const sourceProviders = source.cells.map(cell => new MappingSourceTextProvider(cell));
  const targetProvider = new MappingTargetBoxProvider(target.cells);

  const targetIndexToSources = target.cells.map(targetCell => {
    return source.cells
      .map((sourceCell, index) => {
        if (!bboxIntersects(sourceCell.bbox, targetCell.bbox)) {
          return null;
        }
        return { cell: sourceCell, provider: sourceProviders[index] };
      })
      .filter(nonEmpty);
  });

  const mappingEntries: TextBoxMappingEntry[] = [];

  debug('getTextBoxMapping');
  while (targetProvider.hasNext()) {
    // find matches
    const { index: targetCellIndex, text: targetText } = targetProvider.getNextInfo();
    debug('> find match at index %d, text: %s', targetCellIndex, targetText);
    const matchInSource = findMatchInSources(targetIndexToSources[targetCellIndex], targetText);
    debug('> source cell(s) matched: %o', matchInSource);

    // skip when no match found...
    if (!matchInSource?.match || spanLen(matchInSource.match.span) === 0) {
      targetProvider.skip();
      continue;
    }

    const matchedSourceSpan = matchInSource.match.span;
    const matchedSourceProvider = matchInSource.provider;
    const matchedLength = spanLen(matchedSourceSpan);

    const matchedTargetCells = targetProvider.consume(matchedLength);
    debug('> target cells for matched length: %d', matchedLength);
    debug(matchedTargetCells);

    let consumedSourceSpan: TextSpan = [0, 0];
    matchedTargetCells.forEach(mTargetCell => {
      const trimmedCell = trimCell(mTargetCell);
      if (trimmedCell.text.length > 0) {
        const matchToTargetCell = matchedSourceProvider.getMatch(trimmedCell.text);
        debug('>> target cell %o (%o) to source %o', mTargetCell, trimmedCell, matchToTargetCell);
        if (matchToTargetCell) {
          // consume source text which is just mapped to the target
          matchedSourceProvider.consume(matchToTargetCell.span);
          consumedSourceSpan = spanUnion(consumedSourceSpan, matchToTargetCell.span);
          mappingEntries.push({
            text: { cell: matchInSource.cell, span: matchToTargetCell.span },
            box: { cell: trimmedCell }
          });
          debug('>> added mapping entry %o', mappingEntries[mappingEntries.length - 1]);
        }
      }
    });
    // consume entire the range that is matched to sources
    if (spanLen(consumedSourceSpan) > 0) {
      matchedSourceProvider.consume(consumedSourceSpan);
      debug('> span consumed in source: ', consumedSourceSpan);
    }
  }

  return new TextBoxMappingImpl(mappingEntries);
}

function trimCell(cell: TextLayoutCellBase) {
  const text = cell.text;
  const nLeadingSpaces = text.match(/^\s*/)![0].length;
  const nTrailingSpaces = text.match(/\s*$/)![0].length;
  if (nLeadingSpaces === 0 && nTrailingSpaces === 0) {
    return cell;
  }
  if (text.length > nLeadingSpaces + nTrailingSpaces) {
    return cell.getPartial([nLeadingSpaces, text.length - nTrailingSpaces]);
  }
  return cell.getPartial([0, 0]);
}