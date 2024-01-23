import { TextSpan } from '../../types';
export type TextMatch = {
    /**
     * matched text span
     */
    span: TextSpan;
    /**
     * text before the matched text. i.e. text that will be skipped by using this match
     */
    skipText: string;
    /**
     * distance from the nearest cursors
     */
    minHistoryDistance: number;
    /**
     * text after the matched text
     */
    textAfterEnd: string;
};
/**
 * Manage text in a source (larger) cell.
 * - Find text (in a target cell) from the _unused_ text
 * - Once a span is mapped to a target (smaller) cell, mark the the correspondent span _used_
 */
export declare class TextProvider {
    private readonly fieldText;
    private remainingSpans;
    private history;
    constructor(fieldText: string);
    /**
     * Get how the given `text` matches to the currently available text
     * @param text text to search
     * @param { minLength, maxLength, searchSpan } options match options
     *   minLength, maxLength: specify min/max length of the match.
     *   searchSpan: the span where the `text` is searched
     */
    getMatches(text: string, options?: {
        minLength?: number;
        maxLength?: number;
        searchSpan?: TextSpan;
    }): TextMatch[];
    /**
     * Mark the `span` as used
     */
    consume(span: TextSpan): void;
}
