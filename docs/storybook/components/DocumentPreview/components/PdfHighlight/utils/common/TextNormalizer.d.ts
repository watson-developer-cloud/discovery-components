import { TextSpan } from '../../types';
type SpanMapping = {
    rawSpan: TextSpan;
    normalizedSpan: TextSpan;
};
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
export declare class TextNormalizer {
    readonly rawText: string;
    readonly normalizedText: string;
    readonly normalizationMappings: SpanMapping[];
    constructor(rawText: string);
    /**
     * Convert a span on original text to a span on normalized text
     * @param rawSpan span on original text
     * @returns span on normalized text
     */
    toNormalized(rawSpan: TextSpan): TextSpan;
    /**
     * Convert a span on normalized text to a span on normalized text
     * @param normalizedSpan span on normalized text
     * @returns span on original text
     */
    toRaw(normalizedSpan: TextSpan): TextSpan;
    /**
     * Normalize a text. @see TextNormalizer for the details of the normalization
     * @param text text to be normalized
     * @returns normalized text
     */
    normalize(text: string): string;
    /**
     * Check whether a given text is blank or not
     * @param text text to be tested
     * @returns `true` when the text only contains spaces
     */
    isBlank(text: string): boolean;
}
export {};
