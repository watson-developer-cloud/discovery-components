import { TextSpan } from '../../types';
import {
  END,
  START,
  spanIntersects,
  spanIncludesIndex,
  spanGetText,
  spanIntersection
} from '../common/textSpanUtils';
import { findLargestIndex } from '../common/findLargestIndex';

const MAX_HISTORY = 3;

export type TextMatch = {
  /** matched text span */
  span: TextSpan;
  /** text before the matched text. i.e. text that will be skipped by using this match */
  skipText: string;
  /** distance from the nearest cursors */
  minHistoryDistance: number;
  /** text after the matched text */
  textAfterEnd: string;
};

/**
 * Manage text in a source (larger) cell.
 * - Find text (in a target cell) from the _unused_ text
 * - Once a span is mapped to a target (smaller) cell, mark the the correspondent span _used_
 */
export class TextProvider {
  private readonly fieldText: string;
  private remainingSpans: TextSpan[];
  private history: number[] = [0]; // Keep MAX_HISTORY last recently consumed

  constructor(fieldText: string) {
    this.fieldText = fieldText;
    this.remainingSpans = [[0, fieldText.length]];
  }

  /**
   * Get how the given `text` matches to the currently available text
   */
  getMatches(text: string, minLength = 1, maxLength = text.length): TextMatch[] {
    const match = findLargestIndex(minLength, maxLength + 1, index => {
      const lengthToMatch = index;
      const textToMatch = text.substring(0, lengthToMatch);

      const result: TextMatch[] = [];
      for (const aSpan of this.remainingSpans) {
        const [spanBegin, spanEnd] = aSpan;
        const spanText = this.fieldText.slice(spanBegin, spanEnd);

        const foundIndex = spanText.indexOf(textToMatch);
        if (foundIndex >= 0) {
          const foundSpanBegin = spanBegin + foundIndex;
          const foundSpanEnd = foundSpanBegin + textToMatch.length;
          const historyDistances = this.history.map(i => {
            const v = foundSpanBegin - i;
            return v >= 0 ? v : Number.MAX_SAFE_INTEGER;
          });
          result.push({
            span: [foundSpanBegin, foundSpanEnd],
            skipText: spanText.substring(0, foundIndex),
            minHistoryDistance: Math.min(...historyDistances, this.fieldText.length),
            textAfterEnd: this.remainingSpans
              .map(span => {
                const validSpan = spanIntersection([foundSpanEnd, this.fieldText.length], span);
                return spanGetText(this.fieldText, validSpan);
              })
              .join('')
          });
        }
      }
      return result.length > 0 ? result : null;
    });

    return match ? match.value : [];
  }

  /**
   * Mark the `span` as used
   */
  consume(span: TextSpan) {
    const remaining: TextSpan[] = [];
    this.remainingSpans.forEach(remainingSpan => {
      if (spanIntersects(span, remainingSpan)) {
        if (remainingSpan[START] < span[START]) {
          remaining.push([remainingSpan[START], span[START]]);
        }
        if (span[END] < remainingSpan[END]) {
          remaining.push([span[END], remainingSpan[END]]);
        }
      } else {
        remaining.push(remainingSpan);
      }
    });
    this.remainingSpans = remaining;

    // update history
    const validSpans = [span[END], ...this.history].filter(index => {
      if (spanIncludesIndex(span, index)) return false;
      if (!this.remainingSpans.some(s => spanIncludesIndex(s, index))) return false;
      return true;
    });
    this.history = validSpans.slice(0, MAX_HISTORY);
  }
}
