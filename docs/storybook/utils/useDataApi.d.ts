/// <reference types="react" />
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { SearchClient } from 'components/DiscoverySearch/types';
/**
 * default reducer shape to be extended by concrete stores
 */
interface ReducerState {
    isLoading: boolean;
    isError: boolean;
    data: any;
    parameters: any;
    error: Error | null;
}
/**
 * concrete implementation of the reducer state for fetchFields
 */
export interface FieldsStore extends ReducerState {
    data: DiscoveryV2.ListFieldsResponse | null;
    parameters: DiscoveryV2.ListFieldsParams;
}
/**
 * actions used to interact with the fields api and fields state
 */
export interface FieldsStoreActions {
    /**
     * method used to invoke the search request with an optional callback to return the response data
     */
    fetchFields: () => void;
    setFieldsResponse: (overrideResults?: DiscoveryV2.ListFieldsResponse) => void;
}
/**
 * Concrete usage of the useDataApi helper method for fetching project fields
 * @param fetchFieldsParams - initial search parameters to set
 * @param searchClient - search client used to perform requests
 * @return a 2-element array containing the fields store data and fields-specific store actions
 */
export declare const useFieldsApi: (fetchFieldsParams: DiscoveryV2.ListFieldsParams, searchClient: SearchClient) => [FieldsStore, FieldsStoreActions];
/**
 * concrete implementation of the reducer state for search
 */
export interface SearchResponseStore extends ReducerState {
    data: DiscoveryV2.QueryResponse | null;
    parameters: DiscoveryV2.QueryParams;
}
/**
 * search-specific actions used to interact with the search API and search state
 */
export interface SearchResponseStoreActions {
    /**
     * method to set the parameters to be used with the search API when performSearch is invoked
     */
    setSearchParameters: React.Dispatch<React.SetStateAction<DiscoveryV2.QueryParams & {
        returnFields?: string[];
    }>>;
    /**
     * method to override the current search response
     */
    setSearchResponse: (overrideSearchResponse?: DiscoveryV2.QueryResponse) => void;
    /**
     * method used to invoke the search request with an optional callback to return the response data
     */
    performSearch: (callback?: (result: any) => void) => void;
}
/**
 * concrete usage of the useDataApi helper method for search
 * @param searchParameters - initial search parameters to set
 * @param overrideSearchResults - initial search results to set
 * @param searchClient - search client used to perform requests
 * @return a 2-element array containing the search store data and search-specific store actions
 */
export declare const useSearchResultsApi: (searchParameters: DiscoveryV2.QueryParams & {
    returnFields?: string[];
}, searchClient: SearchClient, overrideSearchResults?: DiscoveryV2.QueryResponse) => [SearchResponseStore, SearchResponseStoreActions];
/**
 * concrete implementation of the reducer state for fetch aggregations
 */
export interface GlobalAggregationsResponseStore extends ReducerState {
    data: DiscoveryV2.QueryAggregation[] | null;
    parameters: DiscoveryV2.QueryParams;
}
/**
 * fetch aggregations actions used to interact with the search API and search state
 */
export interface GlobalAggregationsStoreActions {
    /**
     * method to set the parameters to be used with the search API when fetchAggregations is invoked
     */
    setGlobalAggregationParameters: React.Dispatch<React.SetStateAction<DiscoveryV2.QueryParams>>;
    /**
     * method to override the current aggregations
     */
    setGlobalAggregationsResponse: (aggregationsResponse?: DiscoveryV2.QueryAggregation[]) => void;
    /**
     * method used to invoke the aggregations request with search parameters and an optional callback to return the response data
     */
    fetchGlobalAggregations: (searchParameters: DiscoveryV2.QueryParams, callback?: (result: DiscoveryV2.QueryAggregation[]) => void) => void;
    /**
     * method used to invoke the aggregations request without storing the data with search parameters and an optional callback to return the response data
     */
    fetchGlobalAggregationsWithoutStoring: (searchParameters: DiscoveryV2.QueryParams, callback?: (result: DiscoveryV2.QueryAggregation[]) => void) => void;
}
export declare const useGlobalAggregationsApi: (searchParameters: DiscoveryV2.QueryParams, searchClient: SearchClient, overrideAggregationResults?: DiscoveryV2.QueryAggregation[]) => [GlobalAggregationsResponseStore, GlobalAggregationsStoreActions];
/**
 * concrete implementation of the reducer state for fetch documents
 */
export interface FetchDocumentsResponseStore extends ReducerState {
    data: DiscoveryV2.QueryResponse | null;
    parameters: DiscoveryV2.QueryParams;
}
/**
 * fetch documents actions used to interact with the search API and search state
 */
export interface FetchDocumentsActions {
    /**
     * method used to invoke the search request with a callback to return the response data
     */
    fetchDocuments: (filter: string, collections: string[], callback: (result: DiscoveryV2.QueryResponse) => void) => void;
}
/**
 * concrete usage of the useDataApi helper method for fetching individual documents
 * @param searchParameters - initial search parameters to set
 * @param searchClient - search client used to perform requests
 * @return a 2-element array containing the fetch documents store data and fetchDocuments-specific store actions
 */
export declare const useFetchDocumentsApi: (searchParameters: DiscoveryV2.QueryParams, searchClient: SearchClient) => [FetchDocumentsResponseStore, FetchDocumentsActions];
/**
 * concrete implementation of the reducer state for fetch documents
 */
export interface AutocompleteStore extends ReducerState {
    data: DiscoveryV2.Completions | null;
    parameters: DiscoveryV2.GetAutocompletionParams;
}
/**
 * autocomplete actions used to interact with the autocomplete API and autocomplete state
 */
export interface AutocompleteActions {
    setAutocompletions: (data?: DiscoveryV2.Completions) => void;
    /**
     * method used to invoke the async autocomplete request
     */
    fetchAutocompletions: (autocompleteParameters: DiscoveryV2.GetAutocompletionParams) => void;
}
/**
 * concrete usage of the useDataApi helper method for fetching autocompletions
 * @param autocompleteParmeters - initial autocomplete parameters to set
 * @param searchClient - search client used to perform requests
 * @param overrideAutocompletions - initial autocomplete results to set
 * @return a 2-element array containing the autocomplete store data and autocomplete-specific store actions
 */
export declare const useAutocompleteApi: (autocompleteParmeters: DiscoveryV2.GetAutocompletionParams, searchClient: SearchClient, overrideAutocompletions?: DiscoveryV2.Completions) => [AutocompleteStore, AutocompleteActions];
export {};
