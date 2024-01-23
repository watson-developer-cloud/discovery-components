import { FC } from 'react';
interface SpellingSuggestionProps {
    /**
     * Message prefix used when displaying spelling suggestion
     */
    spellingSuggestionPrefix?: string;
    /**
     * custom handler invoked when any input element changes in the SearchResults component
     */
    onChange?: (searchValue: string) => void;
}
export declare const SpellingSuggestion: FC<SpellingSuggestionProps>;
export {};
