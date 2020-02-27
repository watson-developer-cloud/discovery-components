export {
  default as DiscoverySearch,
  SearchApi,
  SearchContext
} from './components/DiscoverySearch/DiscoverySearch';
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
export { getDocumentTitle } from './components/SearchResults/utils';
