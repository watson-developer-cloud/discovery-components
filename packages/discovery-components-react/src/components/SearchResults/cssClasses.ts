import { settings } from 'carbon-components';

// Multiple search results
export const baseClass = `${settings.prefix}--search-results`;
export const searchResultsListClass = `${baseClass}__list`;
export const searchResultsHeaderClass = `${baseClass}__header`;

// Single search result
export const searchResultClass = `${settings.prefix}--search-result`;
export const searchResultSelectedClass = `${searchResultClass}--selected`;
export const searchResultLoadingClass = `${searchResultClass}--loading`;
export const searchResultCurationClass = `${searchResultClass}_curation`;
export const searchResultContentWrapperClass = `${searchResultClass}__content-wrapper`;
export const searchResultContentWrapperBodyClass = `${searchResultContentWrapperClass}__body`;
export const searchResultContentWrapperBodyButtonClass = `${searchResultContentWrapperBodyClass}__button`;
export const searchResultContentWrapperBodyPassageHighlightsClass = `${searchResultContentWrapperBodyClass}--passage__highlights`;
export const searchResultContentWrapperHalfClass = `${searchResultContentWrapperClass}--half`;
export const searchResultFooterClass = `${searchResultClass}__footer`;
export const searchResultFooterTitleClass = `${searchResultFooterClass}__title`;
export const searchResultFooterCollectionNameClass = `${searchResultFooterClass}__collection-name`;
