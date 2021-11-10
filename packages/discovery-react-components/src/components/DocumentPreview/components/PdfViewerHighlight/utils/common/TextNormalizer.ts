import { TextSpan } from '../../types';
import { END, spanLen, START } from './textSpanUtils';

type SpanMapping = { rawSpan: TextSpan; normalizedSpan: TextSpan };

const SPACES = {
  normal: () => ' ',
  regexString: '\\s+'
};

const DOUBLE_QUOTE = {
  normal: () => '"',
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

const QUOTE = {
  normal: () => "'",
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

const SURROGATE_PAIR = {
  normal: (_: string) => '_',
  regexString: '[\uD800-\uDBFF][\uDC00-\uDFFF]'
};

// remove "Combining Diacritical Marks" from the string
// NOTE: we may have to do this after conversion again
// str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
const DIACRITICAL_MARK = {
  normal: () => '',
  regexString: '[\u0300-\u036f]'
};
const DIACRITICAL_MARK_REGEX = new RegExp(DIACRITICAL_MARK.regexString, 'g');

function normalizeDiacriticalMarks(text: string, keepLength = false) {
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

const NORMALIZATIONS = [SPACES, DOUBLE_QUOTE, QUOTE, SURROGATE_PAIR, DIACRITICAL_MARK].map(n => ({
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
 * Normalize text
 * @param text text to normalize
 * @returns normalized text @see TextNormalizer
 */
export function normalizeText(text: string) {
  const r = NORMALIZATIONS.reduce((text, n) => {
    return text.replace(n.regex, m => n.normal(m));
  }, text);
  return normalizeDiacriticalMarks(r);
}

/**
 * Text normalizer with mapping between spans on original and normalized text
 *
 * Normalize the following in a text:
 * - two or more consequent spaces
 * - single or double quote
 * - surrogate pairs
 * - diacritical marks (accent)
 */
export class TextNormalizer {
  readonly rawText: string;
  readonly normalizedText: string;
  private readonly normalizationMappings: SpanMapping[];

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

  normalize(text: string) {
    return normalizeText(text);
  }

  isBlank(text: string) {
    return text.length === 0 || text.trim().length === 0 || text.match(/^\s*$/);
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

function optimizeSpanMappings(mappings: SpanMapping[]) {
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
