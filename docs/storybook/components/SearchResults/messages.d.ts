export interface Messages {
    /**
     * override the default label for the collection name on each search result
     */
    collectionLabel: string;
    /**
     * override the default button text for previewing excerpts (the document passage or bodyField text) in the document
     */
    viewExcerptInDocumentButtonText: string;
    /**
     * override the default button text for viewing a table in the document
     */
    viewTableInDocumentButtonText: string;
    /**
     * override the default title text for search results list
     */
    searchResultsTitle: string;
    /**
     * override the default label text for the show tables only toggle
     */
    tablesOnlyToggleLabelText: string;
    /**
     * Message prefix used when displaying spelling suggestions
     */
    spellingSuggestionsPrefix: string;
    /**
     * override the default text to show for a search result when no excerpt text (either a passage, defined bodyfield, or text field) is found for the document
     */
    emptyResultContentBodyText: string;
    /**
     * override the default title to show when no search results are found
     */
    noResultsFoundTitle: string;
    /**
     * override the default body text to show when no search results are found
     */
    noResultsFoundText: string;
    /**
     * override the default text to use as the label for the table result
     */
    elementTableLabel: string;
}
export declare const defaultMessages: Messages;
