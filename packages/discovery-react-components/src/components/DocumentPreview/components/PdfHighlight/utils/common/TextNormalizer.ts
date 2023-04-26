import { TextSpan } from '../../types';
import { END, spanLen, START } from '../../../../utils/textSpan';

type SpanMapping = { rawSpan: TextSpan; normalizedSpan: TextSpan };

type CharNormalizer = {
  /**
   * Get normalized character of the original string
   */
  normal: (original: string) => string;
  /**
   * String representation regex that matches to characters to be normalized
   */
  regexString: string;
};

const NULL_CHAR: CharNormalizer = {
  normal: () => '',
  regexString: '\x00'
};

const SPACES: CharNormalizer = {
  normal: (_: string) => ' ',
  regexString: '\\s+'
};

const DOUBLE_QUOTE: CharNormalizer = {
  normal: (_: string) => '"',
  regexString: `[${[
    '«', // U+00AB
    '»', // U+00BB
    '“', // U+201C
    '”', // U+201D
    '„', // U+201E
    '‟', // U+201F
    '❝', // U+275D
    '❞', // U+275E
    '⹂', // U+2E42
    '〝', // U+301D
    '〞', // U+301E
    '〟', // U+301F
    '＂' // U+FF02
  ].join('')}]`
};

const QUOTE: CharNormalizer = {
  normal: (_: string) => "'",
  regexString: `[${[
    '‹', // U+2039
    '›', // U+203A
    '’', // U+2019
    '❮', // U+276E
    '❯', // U+276F
    '‘', // U+2018
    '‚', // U+201A
    '‛', // U+201B
    '❛', // U+275B
    '❜', // U+275C
    '❟' // U+275F
  ].join('')}]`
};

// handle a character that is encoded as a surrogate pair
// in Javascript string (i.e. UTF-16), whose length is 2
// as a single character
const SURROGATE_PAIR: CharNormalizer = {
  normal: (_: string) => '_',
  regexString: '[\uD800-\uDBFF][\uDC00-\uDFFF]'
};

// remove "Combining Diacritical Marks" from the string
// NOTE: we may have to do this after conversion again
// str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
const DIACRITICAL_MARK: CharNormalizer = {
  normal: (_: string) => '',
  regexString: '[\u0300-\u036f]'
};
const DIACRITICAL_MARK_REGEX = new RegExp(DIACRITICAL_MARK.regexString, 'g');

function normalizeDiacriticalMarks(text: string, keepLength = false): string {
  const r = text
    .normalize('NFD')
    .replace(DIACRITICAL_MARK_REGEX, DIACRITICAL_MARK.normal)
    .normalize('NFC');
  if (keepLength && r.length !== text.length) {
    //
    // String.normalize may change length of a string. `keepLength` flag keeps string
    // length after conversion by padding or truncating a string.
    //
    return r.substring(0, text.length).padEnd(text.length, ' ');
  }
  return r;
}

const NORMALIZATIONS = [
  NULL_CHAR,
  SPACES,
  DOUBLE_QUOTE,
  QUOTE,
  SURROGATE_PAIR,
  DIACRITICAL_MARK
].map(n => ({
  ...n,
  regex: new RegExp(n.regexString, 'g')
}));

// regex to match all the chars to normalize.
// the regex is: /(\s+)|(["""])|(['''])|([\u8D..FF])|([\u03..6f])/g
const NORMALIZATIONS_REGEX = new RegExp(
  NORMALIZATIONS.map(n => `(${n.regexString})`).join('|'),
  'g'
);

/**
 * Normalize the following in text:
 * - two or more consecutive spaces to a single space
 * - variants of single quote to `'`
 * - variants of double quote to `"`
 * - surrogate pairs to a single character `_`
 * - remove diacritical marks (accent) from characters
 *
 * This is used for preprocessing to compare texts to ignore minor
 * text differences.
 *
 * @param text text to normalize
 * @returns normalized text @see TextNormalizer
 */
function normalizeText(text: string): string {
  const r = NORMALIZATIONS.reduce((text, n) => {
    return text.replace(n.regex, m => n.normal(m));
  }, text);
  return normalizeDiacriticalMarks(r);
}

/**
 * Text normalizer with mapping between spans on original and normalized text
 *
 * Normalize the following in a text:
 * - two or more consecutive spaces to a single space
 * - variants of single quote to `'`
 * - variants of double quote to `"`
 * - surrogate pairs to a single character `_`
 * - remove diacritical marks (accent) from characters
 */
export class TextNormalizer {
  readonly rawText: string;
  readonly normalizedText: string;
  readonly normalizationMappings: SpanMapping[];

  constructor(rawText: string) {
    this.rawText = rawText;

    let normalizedText = '';
    const addNormalizedText = (text: string) => {
      normalizedText += normalizeDiacriticalMarks(text, true);
    };

    const normalizationMappings: SpanMapping[] = [];
    const re = NORMALIZATIONS_REGEX;
    let cur = 0;
    let match = re.exec(this.rawText);
    while (match != null) {
      const originalChar = match[0];
      let normalizedChar = match[0];
      for (let i = 0; i < match.length - 1; i += 1) {
        if (match[i + 1] != null) {
          normalizedChar = NORMALIZATIONS[i].normal(match[0]);
          break;
        }
      }
      const needNormalize = originalChar !== normalizedChar;

      if (match.index > cur) {
        const newText = this.rawText.substring(cur, match.index);
        if (needNormalize) {
          const rawSpan: TextSpan = [cur, match.index];
          const normalizedSpan: TextSpan = [
            normalizedText.length,
            normalizedText.length + newText.length
          ];
          normalizationMappings.push({ rawSpan, normalizedSpan });
          addNormalizedText(newText);
          cur += newText.length;
        }
      }

      if (needNormalize) {
        const newText = normalizedChar;
        const rawSpan: TextSpan = [match.index, match.index + match[0].length];
        const normalizedSpan: TextSpan = [
          normalizedText.length,
          normalizedText.length + newText.length
        ];
        normalizationMappings.push({ rawSpan, normalizedSpan });
        addNormalizedText(newText);
        cur = re.lastIndex;
      }
      match = re.exec(this.rawText);
    }

    if (cur < this.rawText.length) {
      const newText = this.rawText.substring(cur);
      const rawSpan: TextSpan = [cur, cur + newText.length];
      const normalizedSpan: TextSpan = [
        normalizedText.length,
        normalizedText.length + newText.length
      ];
      normalizationMappings.push({ rawSpan, normalizedSpan });
      addNormalizedText(newText);
    }

    this.normalizedText = normalizedText;
    this.normalizationMappings = optimizeSpanMappings(normalizationMappings);
  }

  /**
   * Convert a span on original text to a span on normalized text
   * @param rawSpan span on original text
   * @returns span on normalized text
   */
  toNormalized(rawSpan: TextSpan): TextSpan {
    const [rawBegin, rawEnd] = rawSpan;

    const normalizedIndex = (raw: number) => {
      if (raw < 0) {
        return raw;
      }
      const beginIndex = this.normalizationMappings.findIndex(({ rawSpan }) => raw < rawSpan[END]);
      if (beginIndex >= 0) {
        const { rawSpan, normalizedSpan } = this.normalizationMappings[beginIndex];
        return mapCharIndexOnSpans(raw, { from: rawSpan, to: normalizedSpan });
      }
      const last = this.normalizationMappings[this.normalizationMappings.length - 1];
      return raw - last.rawSpan[END] + last.normalizedSpan[END];
    };
    return [normalizedIndex(rawBegin), normalizedIndex(rawEnd)];
  }

  /**
   * Convert a span on normalized text to a span on normalized text
   * @param normalizedSpan span on normalized text
   * @returns span on original text
   */
  toRaw(normalizedSpan: TextSpan): TextSpan {
    const [normalizedBegin, normalizedEnd] = normalizedSpan;

    const rawIndex = (normalized: number) => {
      if (normalized < 0) {
        return normalized;
      }
      const beginIndex = this.normalizationMappings.findIndex(
        ({ normalizedSpan }) => normalized < normalizedSpan[END]
      );
      if (beginIndex >= 0) {
        const { rawSpan, normalizedSpan } = this.normalizationMappings[beginIndex];
        return mapCharIndexOnSpans(normalized, { from: normalizedSpan, to: rawSpan });
      }
      const last = this.normalizationMappings[this.normalizationMappings.length - 1];
      return normalized - last.normalizedSpan[END] + last.rawSpan[END];
    };
    return [rawIndex(normalizedBegin), rawIndex(normalizedEnd)];
  }

  /**
   * Normalize a text. @see TextNormalizer for the details of the normalization
   * @param text text to be normalized
   * @returns normalized text
   */
  normalize(text: string): string {
    return normalizeText(text);
  }

  /**
   * Check whether a given text is blank or not
   * @param text text to be tested
   * @returns `true` when the text only contains spaces
   */
  isBlank(text: string): boolean {
    return text.length === 0 || text.trim().length === 0 || !!text.match(/^\s*$/);
  }
}

/**
 * Map charIndex on a 'from' span to index on 'to' span
 * @param charIndex char index to map
 * @param mapping {from: Span, to: Span} spans
 * @returns
 */
function mapCharIndexOnSpans(
  charIndex: number,
  { from: fromSpan, to: toSpan }: { from: TextSpan; to: TextSpan }
): number {
  if (spanLen(fromSpan) === spanLen(toSpan)) {
    return toSpan[START] + (charIndex - fromSpan[START]);
  }
  return (
    toSpan[START] +
    Math.round((charIndex - fromSpan[START]) * (spanLen(toSpan) / spanLen(fromSpan)))
  );
}

/**
 * Optimize the mappings between spans on original text and spans on normalized text
 * by merging consecutive identical mappings
 *
 * Example: given mapping:
 *  (original: [0,10] -> normalized: [0,10])
 *  (original: [10,20] -> normalized: [10,20])
 *  (original: [20,25] -> normalized: [20,21])
 * The mapping above is optimized to:
 *  (original: [0,20] -> normalized: [0,20])
 *  (original: [20,25] -> normalized: [20,21])
 */
function optimizeSpanMappings(mappings: SpanMapping[]): SpanMapping[] {
  const sameLength = (mapping: SpanMapping) =>
    spanLen(mapping.normalizedSpan) === spanLen(mapping.rawSpan);
  const isShifted = (a: SpanMapping, b: SpanMapping) =>
    b.normalizedSpan[START] - a.normalizedSpan[START] === b.rawSpan[START] - a.rawSpan[START];

  return mappings.reduce((acc, mapping) => {
    const lastMapping = acc.length > 0 ? acc[acc.length - 1] : null;
    if (
      sameLength(mapping) &&
      lastMapping &&
      sameLength(lastMapping) &&
      isShifted(lastMapping, mapping)
    ) {
      // merge mappings
      lastMapping.normalizedSpan[END] = mapping.normalizedSpan[END];
      lastMapping.rawSpan[END] = mapping.rawSpan[END];
      return acc;
    }
    acc.push(mapping);
    return acc;
  }, [] as SpanMapping[]);
}
