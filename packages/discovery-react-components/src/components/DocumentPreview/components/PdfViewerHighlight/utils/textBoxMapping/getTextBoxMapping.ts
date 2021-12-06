import minBy from 'lodash/minBy';
import { TextSpan } from '../../types';
import { nonEmpty } from '../common/nonEmpty';
import { bboxesIntersect } from '../../../../utils/box';
import { spanLen, spanMerge } from '../../../../utils/textSpan';
import { TextLayout, TextLayoutCell, TextLayoutCellBase } from '../textLayout/types';
import { MappingSourceTextProvider } from './MappingSourceTextProvider';
import { MappingTargetBoxProvider } from './MappingTargetCellProvider';
import { TextBoxMappingBuilder } from './TextBoxMapping';
import { TextBoxMapping } from './types';

const debugOut = require('debug')?.('pdf:mapping:getTextBoxMapping');
function debug(...args: any) {
  debugOut?.apply(null, args);
}

/**
 * Calculate text box mapping from `source` text layout to `target` text layout
 * @param source text layout with larger cells
 * @param target text layout with smaller cells
 * @returns a text box mapping instance
 */
export function getTextBoxMappings<
  SourceCell extends TextLayoutCell,
  TargetCell extends TextLayoutCell
>(sourceLayout: TextLayout<SourceCell>, targetLayout: TextLayout<TargetCell>): TextBoxMapping {
  debug('getTextBoxMapping: enter');

  const target = new Target(targetLayout);
  const source = new Source(sourceLayout, targetLayout);
  const builder = new TextBoxMappingBuilder();

  target.processText((targetCellId, targetText, markTargetAsMapped) => {
    const matchInSource = source.findMatch(targetCellId, targetText);
    if (matchInSource) {
      const mappedTargetCells = markTargetAsMapped(matchInSource.matchLength);

      let mappedSourceFullSpan: TextSpan = [0, 0];
      mappedTargetCells.forEach(targetCell => {
        const mappedSourceSpan = matchInSource.markSourceAsMapped(targetCell.text);
        if (mappedSourceSpan) {
          builder.addMapping(
            { cell: matchInSource.cell, span: mappedSourceSpan },
            { cell: targetCell }
          );
          mappedSourceFullSpan = spanMerge(mappedSourceFullSpan, mappedSourceSpan);
        }
      });
      if (spanLen(mappedSourceFullSpan) > 0) {
        matchInSource.markSourceMappedBySpan(mappedSourceFullSpan);
      }
    }
  });

  return builder.toTextBoxMapping();
}

/**
 * Utility class for manipulating target text layout in getTextBoxMapping
 */
class Target<TargetCell extends TextLayoutCell> {
  targetProvider: MappingTargetBoxProvider;

  constructor(targetLayout: TextLayout<TargetCell>) {
    this.targetProvider = new MappingTargetBoxProvider(targetLayout.cells);
  }

  /**
   * Try to map text fragments (`cellId` and `text` passed to `textMapper`)
   * in target using a given `textMapper`
   */
  processText(
    textMapper: (
      cellId: number,
      text: string,
      markTargetMapped: (length: number) => TextLayoutCellBase[]
    ) => void
  ) {
    while (this.targetProvider.hasNext()) {
      const { index: cellId, text: nextText } = this.targetProvider.getNextInfo();
      debug('> find match at index %d, text: %s', cellId, nextText);

      let isMapped = false;
      const markAsMapped = (matchedLength: number) => {
        if (matchedLength > 0) {
          isMapped = true;
          const matchedTargetCells = this.targetProvider.consume(matchedLength);
          debug('> raw target cells for matched length: %d', matchedLength);
          debug(matchedTargetCells);

          return matchedTargetCells.map(cell => cell.trim()).filter(cell => cell.text.length > 0);
        }
        return [];
      };

      textMapper(cellId, nextText, markAsMapped);
      if (!isMapped) {
        this.targetProvider.skip();
      }
    }
  }
}

/**
 * Utility class for manipulating source text layout and its source text in getTextBoxMapping
 */
class Source<SourceCell extends TextLayoutCell, TargetCell extends TextLayoutCell> {
  sourceProviders: MappingSourceTextProvider[];
  targetIndexToSources: {
    cell: SourceCell;
    provider: MappingSourceTextProvider;
  }[][];

  constructor(sourceLayout: TextLayout<SourceCell>, targetLayout: TextLayout<TargetCell>) {
    this.sourceProviders = sourceLayout.cells.map(cell => new MappingSourceTextProvider(cell));
    this.targetIndexToSources = targetLayout.cells.map(targetCell => {
      const cells = sourceLayout.cells
        .map((sourceCell, index) => {
          if (!bboxesIntersect(sourceCell.bbox, targetCell.bbox)) {
            return null;
          }
          return { cell: sourceCell, provider: this.sourceProviders[index] };
        })
        .filter(nonEmpty);

      if (cells.some(({ cell }) => cell.isInHtmlBbox)) {
        return cells.filter(({ cell }) => cell.isInHtmlBbox);
      }
      return cells;
    });
  }

  /**
   * Find the best (i.e. longest length `text`) match in source which intersects
   * with the target cell of given `targetCellId`
   * @param targetCellId
   * @param text
   * @return matched source information and functions to mark the matched span as mapped
   */
  findMatch(targetCellId: TargetCell['id'], text: string) {
    const candidateSources = this.targetIndexToSources[targetCellId];
    const bestMatch = Source.findBestMatch(candidateSources, text);
    debug('> source cell(s) matched: %o', bestMatch);

    if (!bestMatch?.match || spanLen(bestMatch.match.span) === 0) {
      return null;
    }

    const matchedCell = bestMatch.cell;
    const matchedSourceSpan = bestMatch.match.span;
    const matchedSourceProvider = bestMatch.provider;

    return {
      cell: matchedCell,
      matchLength: spanLen(matchedSourceSpan),
      markSourceAsMapped: (text: string) => {
        const mappedSource = matchedSourceProvider.getMatch(text);
        debug('>> target cell %o to source %o', text, mappedSource);
        return mappedSource?.span;
      },
      markSourceMappedBySpan: (span: TextSpan) => {
        if (spanLen(span) > 0) {
          matchedSourceProvider.consume(span);
        }
      }
    };
  }

  /**
   * Find the best source (larger text layout cell) where text `textToMatch` is in
   * @param sources source (larger) text layout cells overlapping the current target cell
   * @param textToMatch text form target cell(s)
   * @returns the best source where the `textToMatch` is matched and the text location in the source
   */
  private static findBestMatch(
    sources: {
      cell: TextLayoutCell;
      provider: MappingSourceTextProvider;
    }[],
    textToMatch: string
  ) {
    // find matches
    const matches = sources.map(source => {
      const match = source.provider.getMatch(textToMatch);
      return { ...source, match };
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
}
