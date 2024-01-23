// components
export {
  default as DiscoverySearch,
  SearchApi,
  SearchContext
} from './components/DiscoverySearch/DiscoverySearch';
export type { SearchContextIFC } from './components/DiscoverySearch/DiscoverySearch';
export { default as SearchInput } from './components/SearchInput/SearchInput';
export { default as SearchFacets } from './components/SearchFacets/SearchFacets';
export { default as ResultsPagination } from './components/ResultsPagination/ResultsPagination';
export { DocumentPreview } from './components/DocumentPreview/DocumentPreview';
export { default as SearchResults } from './components/SearchResults/SearchResults';
export {
  HtmlView,
  canRenderHtmlView
} from './components/DocumentPreview/components/HtmlView/HtmlView';
export { CIDocument, canRenderCIDocument } from './components/CIDocument/CIDocument';
export { default as StructuredQuery } from './components/StructuredQuery/StructuredQuery';

// utility methods
export { getDocumentTitle } from './utils/getDocumentTitle';
export { default as useSafeRef } from './utils/useSafeRef';
export { default as useSize } from './utils/useSize';
export { escapeFieldName } from './components/SearchFacets/utils/escapeFieldName';
export { default as setPdfJsGlobalWorkerOptions } from './utils/setPdfJsGlobalWorkerOptions';
