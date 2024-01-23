import React from 'react';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { FetchDocumentsResponseStore, SearchResponseStore, AutocompleteStore, FieldsStore, GlobalAggregationsResponseStore } from 'utils/useDataApi';
import { DocumentProvider, SearchClient, SearchParams } from './types';
import { QueryAggregationWithName } from 'components/SearchFacets/utils/searchFacetInterfaces';
export interface DiscoverySearchProps {
    /**
     * Search client
     */
    searchClient: SearchClient;
    /**
     * Project ID
     */
    projectId: string;
    /**
     * Provide original document (e.g. PDF) to render when previewing. If not
     * specified, or a document isn't provided, preview will fall back to HTML
     * or text.
     */
    documentProvider?: DocumentProvider;
    /**
     * Aggregation results used to override internal aggregation search results state
     */
    overrideAggregationResults?: DiscoveryV2.QueryAggregation[] | QueryAggregationWithName[];
    /**
     * Search response used to override internal search results state
     */
    overrideSearchResults?: DiscoveryV2.QueryResponse;
    /**
     * Query parameters used to override internal query parameters state
     */
    overrideQueryParameters?: SearchParams;
    /**
     * overrideSelectedResult is used to override internal selected result state
     */
    overrideSelectedResult?: SelectedResult;
    /**
     * Autocompletion suggestions for the searchInput
     */
    overrideAutocompletionResults?: DiscoveryV2.Completions;
    /**
     * overrideCollectionsResults is used to override internal collections result state
     */
    overrideCollectionsResults?: DiscoveryV2.ListCollectionsResponse;
    /**
     * overrideComponentSettings is used to override internal collections result state
     */
    overrideComponentSettings?: DiscoveryV2.ComponentSettingsResponse;
}
export interface AutocompletionOptions {
    /**
     * Whether or not to update the autocompletions
     */
    updateAutocompletions?: boolean;
    /**
     * Number of autocomplete suggestions to fetch
     */
    completionsCount?: number;
    /**
     * The minimum number of characters necessary to run autocompletion
     */
    minCharsToAutocomplete?: number;
    /**
     * String to split words on in the query
     */
    splitSearchQuerySelector?: string;
}
export interface SelectedResult {
    document: DiscoveryV2.QueryResult | null;
    element?: DiscoveryV2.QueryTableResult | DiscoveryV2.QueryResultPassage | null;
    elementType?: 'table' | 'passage' | null;
}
export declare const emptySelectedResult: {
    document: null;
    element: null;
    elementType: null;
};
export interface SearchContextIFC {
    aggregationResults?: DiscoveryV2.QueryAggregation[] | QueryAggregationWithName[] | null;
    searchResponseStore: SearchResponseStore;
    fetchDocumentsResponseStore: FetchDocumentsResponseStore;
    collectionsResults?: DiscoveryV2.ListCollectionsResponse;
    selectedResult: SelectedResult;
    autocompletionStore: AutocompleteStore;
    componentSettings?: DiscoveryV2.ComponentSettingsResponse;
    isResultsPaginationComponentHidden?: boolean;
    fieldsStore: FieldsStore;
    globalAggregationsResponseStore: GlobalAggregationsResponseStore;
    documentProvider?: DocumentProvider;
}
export interface SearchApiIFC {
    performSearch: (searchParameters: DiscoveryV2.QueryParams, resetAggregations?: boolean) => void;
    fetchAutocompletions: (nlq: string) => Promise<void>;
    fetchAggregations: (searchParameters: DiscoveryV2.QueryParams) => Promise<void>;
    fetchDocuments: (filterString: string, collections?: string[], searchResponse?: DiscoveryV2.QueryResponse) => void;
    setSelectedResult: (result: SelectedResult) => void;
    setAutocompletionOptions: (autoCompletionOptions: AutocompletionOptions | React.SetStateAction<AutocompletionOptions>) => void;
    setSearchParameters: (searchParameters: DiscoveryV2.QueryParams | React.SetStateAction<DiscoveryV2.QueryParams>) => void;
    setIsResultsPaginationComponentHidden: (isResultsPaginationComponentHidden: boolean | React.SetStateAction<boolean | undefined>) => void;
    fetchFields: () => void;
}
export declare const searchApiDefaults: {
    performSearch: () => Promise<void>;
    fetchAutocompletions: () => Promise<void>;
    fetchAggregations: () => Promise<void>;
    fetchComponentSettings: () => Promise<void>;
    fetchDocuments: () => void;
    setSelectedResult: () => void;
    setAutocompletionOptions: () => void;
    setSearchParameters: () => void;
    setIsResultsPaginationComponentHidden: () => void;
    fetchFields: () => Promise<void>;
};
export declare const searchResponseStoreDefaults: SearchResponseStore;
export declare const globalAggregationsResponseStoreDefaults: GlobalAggregationsResponseStore;
export declare const fetchDocumentsResponseStoreDefaults: FetchDocumentsResponseStore;
export declare const autocompletionStoreDefaults: AutocompleteStore;
export declare const searchContextDefaults: {
    searchResponseStore: SearchResponseStore;
    globalAggregationsResponseStore: GlobalAggregationsResponseStore;
    fetchDocumentsResponseStore: FetchDocumentsResponseStore;
    selectedResult: {
        document: null;
        element: null;
        elementType: null;
    };
    autocompletionStore: AutocompleteStore;
    isResultsPaginationComponentHidden: boolean;
    fieldsStore: FieldsStore;
};
export declare const SearchApi: React.Context<SearchApiIFC>;
export declare const SearchContext: React.Context<SearchContextIFC>;
declare const _default: React.ComponentType<DiscoverySearchProps>;
export default _default;
