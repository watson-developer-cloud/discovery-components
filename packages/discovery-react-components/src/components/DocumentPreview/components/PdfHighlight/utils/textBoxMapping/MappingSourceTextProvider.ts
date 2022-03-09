import minBy from 'lodash/minBy';
import { spanGetText, spanLen, START } from '../../../../utils/textSpan';
import { TextSpan } from '../../types';
import { TextNormalizer } from '../common/TextNormalizer';
import { TextLayoutCell } from '../textLayout/types';
import { TextProvider } from './TextProvider';

const debugOut = require('debug')?.('pdf:mapping:MappingSourceTextProvider');
function debug(...args: any) {
  debugOut?.apply(null, args);
}

/**
 * TextProvider with normalization
 * @see TextProvider
 */
export class MappingSourceTextProvider {
  private readonly cell: TextLayoutCell;
  private readonly normalizer: TextNormalizer;
  private readonly provider: TextProvider;

  constructor(cell: TextLayoutCell) {
    this.cell = cell;
    this.normalizer = new TextNormalizer(cell.text);
    this.provider = new TextProvider(this.normalizer.normalizedText);
  }

  /**
   * Find the best span where the give text matches to the rest of the text
   */
  getMatch(text: string, options: { minLength?: number; searchSpan?: TextSpan } = {}) {
    const { minLength = 1, searchSpan } = options;
    const normalizedText = this.normalizer.normalize(text);
    const normalizedSearchSpan = searchSpan ? this.normalizer.toNormalized(searchSpan) : searchSpan;
    debug('getMatch "%s", normalized "%s", minLength = %d', text, normalizedText, minLength);
    const normalizedMatches = this.provider.getMatches(normalizedText, {
      minLength,
      searchSpan: normalizedSearchSpan
    });
    debug('normalized matches: %o', normalizedMatches);

    // find best
    const normalizedResult = minBy(normalizedMatches, m => m.minHistoryDistance);
    if (!normalizedResult) {
      debug('getMatch result: null');
      return null;
    }

    const rawMatchedSpan = this.normalizer.toRaw(normalizedResult.span);
    const rawSkipTextSpan = this.normalizer.toRaw([
      normalizedResult.span[START] - normalizedResult.skipText.length,
      normalizedResult.span[START]
    ]);
    const r = {
      span: rawMatchedSpan,
      skipText: spanGetText(this.cell.text, rawSkipTextSpan),
      score: spanLen(rawMatchedSpan) - normalizedResult.minHistoryDistance,
      approxLenAfterEnd: normalizedResult.textAfterEnd.length
    };
    debug('getMatch result: %o', r);
    return r;
  }

  /**
   * Mark the given `span` as used
   */
  consume(span: TextSpan) {
    const normalizedSpan = this.normalizer.toNormalized(span);
    this.provider.consume(normalizedSpan);
    debug('text span consumed %o', span);
  }

  /**
   * Check whether a given text is blank or not
   */
  isBlank(text: string): boolean {
    return this.normalizer.isBlank(text);
  }
}
