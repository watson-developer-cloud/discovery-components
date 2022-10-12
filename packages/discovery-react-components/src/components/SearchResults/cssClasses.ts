import { settings } from 'carbon-components';

// Multiple search results
export const baseClass = `${settings.prefix}--search-results`;
export const searchResultsListClass = `${baseClass}__list`;
export const searchResultsHeaderClass = `${baseClass}__header`;
export const searchResultsTitleClass = `${searchResultsHeaderClass}__title`;
export const searchResultsTitleTextClass = `${searchResultsTitleClass}__text`;
export const searchResultsTitleQueryClass = `${searchResultsTitleClass}__query`;
export const searchResultsEmptyListClass = `${baseClass}__empty-list`;
export const searchResultsEmptyTitleClass = `${searchResultsEmptyListClass}__title`;
export const searchResultsEmptyTextClass = `${searchResultsEmptyListClass}__text`;

// Single search result
export const searchResultClass = `${settings.prefix}--search-result`;
export const searchResultSelectedClass = `${searchResultClass}--selected`;
export const searchResultLoadingClass = `${searchResultClass}--loading`;
export const searchResultCurationClass = `${searchResultClass}_curation`;
export const searchResultContentWrapperClass = `${searchResultClass}__content-wrapper`;
export const searchResultContentWrapperBodyClass = `${searchResultContentWrapperClass}__body`;
export const searchResultContentWrapperBodyButtonClass = `${searchResultContentWrapperBodyClass}__button`;
export const searchResultContentWrapperBodyPassageHighlightsClass = `${searchResultContentWrapperBodyClass}--passage__highlights`;
export const searchResultFooterClass = `${searchResultClass}__footer`;
export const searchResultFooterTitleClass = `${searchResultFooterClass}__title`;
export const searchResultFooterCollectionNameClass = `${searchResultFooterClass}__collection-name`;
