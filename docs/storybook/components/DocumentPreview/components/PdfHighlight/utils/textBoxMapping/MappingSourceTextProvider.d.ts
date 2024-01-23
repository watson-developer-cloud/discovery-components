import { TextSpan } from '../../types';
import { TextLayoutCell } from '../textLayout/types';
/**
 * TextProvider with normalization
 * @see TextProvider
 */
export declare class MappingSourceTextProvider {
    private readonly cell;
    private readonly normalizer;
    private readonly provider;
    constructor(cell: TextLayoutCell);
    /**
     * Find the best span where the give text matches to the rest of the text
     */
    getMatch(text: string, options?: {
        minLength?: number;
        searchSpan?: TextSpan;
    }): {
        span: import("../../../../types").TextSpan;
        skipText: string;
        score: number;
        approxLenAfterEnd: number;
    } | null;
    /**
     * Mark the given `span` as used
     */
    consume(span: TextSpan): void;
    /**
     * Check whether a given text is blank or not
     */
    isBlank(text: string): boolean;
}
