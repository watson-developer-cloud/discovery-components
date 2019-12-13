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
   * override the default text to show when no search results are found
   */
  noResultsFoundText: string;
  /**
   * override the default text to show when there was an error rendering the SearchResults component
   */
  errorMessage: string;
}

export const defaultMessages: Messages = {
  collectionLabel: 'Collection:',
  viewExcerptInDocumentButtonText: 'View passage in document',
  viewTableInDocumentButtonText: 'View table in document',
  tablesOnlyToggleLabelText: 'Show table results only',
  spellingSuggestionsPrefix: 'Did you mean:',
  emptyResultContentBodyText: 'Excerpt unavailable.',
  noResultsFoundText: 'There were no results found',
  errorMessage: 'There was an error rendering your search results'
};
