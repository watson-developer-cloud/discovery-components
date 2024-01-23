/**
 * @class SearchInput
 */
/// <reference types="react" />
import { Messages } from './messages';
export interface SearchInputProps {
    /**
     * className to style SearchInput
     */
    className?: string;
    /**
     * ID for the SearchInput
     */
    id?: string;
    /**
     * Value to split words in the search query (default: ' ')
     */
    splitSearchQuerySelector?: string;
    /**
     * Number of autocomplete suggestions to show in the autocomplete dropdown
     */
    completionsCount?: number;
    /**
     * Prop to show/hide the autocomplete dropdown
     */
    showAutocomplete?: boolean;
    /**
     * Minimum number of characters present in the last word before the SearchInput fetches autocomplete suggestions
     */
    minCharsToAutocomplete?: number;
    /**
     * True to return spelling suggestion with results
     */
    spellingSuggestions?: boolean;
    /**
     * Override default messages for the component by specifying custom and/or internationalized text strings
     */
    messages?: Partial<Messages>;
    /**
     * number of milliseconds to wait before executing an API request to get autocompletions
     */
    autocompleteDelay?: number;
    /**
     * custom handler invoked when any input element changes in the SearchInput component
     */
    onChange?: (searchValue: string) => void;
    /**
     * Props to be passed into Carbon's Search component
     */
    [key: string]: any;
}
declare const _default: import("react").ComponentType<SearchInputProps>;
export default _default;
