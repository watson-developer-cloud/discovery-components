import React, { createContext, FC, useEffect, useState, useCallback, useMemo } from 'react';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import {
  useDeepCompareEffect,
  useDeepCompareCallback,
  useDeepCompareMemo
} from 'utils/useDeepCompareMemoize';
import {
  FetchDocumentsResponseStore,
  SearchResponseStore,
  AutocompleteStore,
  useSearchResultsApi,
  useFetchDocumentsApi,
  useAutocompleteApi
} from 'utils/useDataApi';
import { SearchClient } from './types';

export type SearchParams = Omit<DiscoveryV2.QueryParams, 'projectId' | 'headers'>;

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
   * Aggregation results used to override internal aggregation search results state
   */
  overrideAggregationResults?: DiscoveryV2.QueryAggregation[];
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

export const emptySelectedResult = {
  document: null,
  element: null,
  elementType: null
};

export interface SearchContextIFC {
  aggregationResults: DiscoveryV2.QueryAggregation[] | null;
  searchResponseStore: SearchResponseStore;
  fetchDocumentsResponseStore: FetchDocumentsResponseStore;
  collectionsResults: DiscoveryV2.ListCollectionsResponse | null;
  selectedResult: SelectedResult;
  autocompletionStore: AutocompleteStore;
  componentSettings: DiscoveryV2.ComponentSettingsResponse | null;
  isResultsPaginationComponentHidden: boolean | undefined;
}

export interface SearchApiIFC {
  performSearch: (searchParameters: DiscoveryV2.QueryParams, resetAggregations?: boolean) => void;
  fetchAutocompletions: (nlq: string) => Promise<void>;
  fetchAggregations: (searchParameters: DiscoveryV2.QueryParams) => Promise<void>;
  fetchDocuments: (filterString: string, searchResponse: DiscoveryV2.QueryResponse | null) => void;
  setSelectedResult: (result: SelectedResult) => void;
  setAutocompletionOptions: (
    autoCompletionOptions: AutocompletionOptions | React.SetStateAction<AutocompletionOptions>
  ) => void;
  setSearchParameters: (
    searchParameters: DiscoveryV2.QueryParams | React.SetStateAction<DiscoveryV2.QueryParams>
  ) => void;
  setIsResultsPaginationComponentHidden: (
    isResultsPaginationComponentHidden: boolean | React.SetStateAction<boolean | undefined>
  ) => void;
}

export const searchApiDefaults = {
  performSearch: (): Promise<void> => Promise.resolve(),
  fetchAutocompletions: (): Promise<void> => Promise.resolve(),
  fetchAggregations: (): Promise<void> => Promise.resolve(),
  fetchComponentSettings: (): Promise<void> => Promise.resolve(),
  fetchDocuments: (): void => {},
  setSelectedResult: (): void => {},
  setAutocompletionOptions: (): void => {},
  setSearchParameters: (): void => {},
  setIsResultsPaginationComponentHidden: (): void => {}
};

export const searchResponseStoreDefaults: SearchResponseStore = {
  parameters: {
    projectId: ''
  },
  data: null,
  isLoading: false,
  isError: false
};

export const fetchDocumentsResponseStoreDefaults: FetchDocumentsResponseStore = {
  parameters: {
    projectId: '',
    returnFields: [],
    aggregation: '',
    passages: {
      enabled: false
    },
    tableResults: {
      enabled: false
    }
  },
  data: null,
  isLoading: false,
  isError: false
};

export const autocompletionStoreDefaults: AutocompleteStore = {
  parameters: {
    projectId: ''
  },
  data: null,
  isLoading: false,
  isError: false
};

const aggregationQueryDefaults: Partial<DiscoveryV2.QueryParams> = {
  count: 0,
  passages: {
    enabled: false
  },
  tableResults: {
    enabled: false
  }
};

export const searchContextDefaults = {
  aggregationResults: null,
  searchResponseStore: searchResponseStoreDefaults,
  fetchDocumentsResponseStore: fetchDocumentsResponseStoreDefaults,
  selectedResult: emptySelectedResult,
  autocompletionStore: autocompletionStoreDefaults,
  collectionsResults: null,
  componentSettings: null,
  isResultsPaginationComponentHidden: false
};

export const SearchApi = createContext<SearchApiIFC>(searchApiDefaults);
export const SearchContext = createContext<SearchContextIFC>(searchContextDefaults);

export const DiscoverySearch: FC<DiscoverySearchProps> = ({
  searchClient,
  projectId,
  overrideAggregationResults = null,
  overrideSearchResults = null,
  overrideQueryParameters,
  overrideSelectedResult = emptySelectedResult,
  overrideAutocompletionResults = null,
  overrideCollectionsResults = null,
  overrideComponentSettings = null,
  children
}) => {
  const [aggregationResults, setAggregationResults] = useState<
    DiscoveryV2.QueryAggregation[] | null
  >(overrideAggregationResults);
  const [
    collectionsResults,
    setCollectionsResults
  ] = useState<DiscoveryV2.ListCollectionsResponse | null>(overrideCollectionsResults);
  const [autocompletionOptions, setAutocompletionOptions] = useState<AutocompletionOptions>({});
  const [selectedResult, setSelectedResult] = useState<SelectedResult>(overrideSelectedResult);
  const [
    componentSettings,
    setComponentSettings
  ] = useState<DiscoveryV2.ComponentSettingsResponse | null>(overrideComponentSettings);
  const [isResultsPaginationComponentHidden, setIsResultsPaginationComponentHidden] = useState<
    boolean
  >();

  const [
    searchResponseStore,
    { setSearchResponse, setSearchParameters, performSearch }
  ] = useSearchResultsApi(
    { projectId, ...overrideQueryParameters },
    overrideSearchResults,
    searchClient
  );

  const handleSearch = useCallback(
    async (searchParameters, resetAggregations = true): Promise<void> => {
      let aggregationsFetched = false;
      setSearchParameters(searchParameters);
      // don't use the search response if filter is set, just do another search
      if (resetAggregations && searchParameters.filter !== '') {
        aggregationsFetched = true;
        searchClient
          .query({ ...searchParameters, ...aggregationQueryDefaults, filter: '' })
          .then(response => {
            if (response && response.result && response.result.aggregations) {
              setAggregationResults(response.result.aggregations);
            }
          });
      }

      performSearch(result => {
        if (!aggregationsFetched && resetAggregations && result && result.aggregations) {
          setAggregationResults(result.aggregations);
        }
      });
    },
    [performSearch, setSearchParameters]
  );

  const [autocompletionStore, { fetchAutocompletions, setAutocompletions }] = useAutocompleteApi(
    { projectId, count: autocompletionOptions.completionsCount },
    overrideAutocompletionResults,
    searchClient
  );

  useDeepCompareEffect(() => {
    setSearchResponse(overrideSearchResults);
  }, [overrideSearchResults]);

  useDeepCompareEffect(() => {
    setSearchParameters(currentSearchParameters => {
      return {
        ...currentSearchParameters,
        projectId,
        ...overrideQueryParameters
      };
    });
  }, [projectId, overrideQueryParameters]);

  useDeepCompareEffect(() => {
    setAggregationResults(overrideAggregationResults);
  }, [overrideAggregationResults]);

  useDeepCompareEffect(() => {
    setCollectionsResults(overrideCollectionsResults);
  }, [overrideCollectionsResults]);

  useDeepCompareEffect(() => {
    setSelectedResult(overrideSelectedResult);
  }, [overrideSelectedResult]);

  useDeepCompareEffect(() => {
    setAutocompletions(overrideAutocompletionResults);
  }, [overrideAutocompletionResults]);

  useDeepCompareEffect(() => {
    setComponentSettings(overrideComponentSettings);
  }, [overrideComponentSettings]);

  useEffect(() => {
    async function fetchCollections(): Promise<void> {
      const { result } = await searchClient.listCollections({ projectId });
      setCollectionsResults(result);
    }
    async function getComponentSettings(): Promise<void> {
      const { result } = await searchClient.getComponentSettings({ projectId });
      setComponentSettings(result);
    }
    fetchCollections();
    getComponentSettings();
  }, [searchClient, projectId]);

  // helper method that handles the logic to fetch completions whenever the search query is updated
  const handleFetchAutocompletions = useDeepCompareCallback(
    async (searchQuery: string): Promise<void> => {
      const {
        splitSearchQuerySelector,
        updateAutocompletions: updateAutocomplete,
        completionsCount,
        minCharsToAutocomplete
      } = autocompletionOptions;
      if (
        updateAutocomplete &&
        !!completionsCount &&
        !!splitSearchQuerySelector &&
        minCharsToAutocomplete !== undefined
      ) {
        /**
         * If user clicks space consider searching a new word. Also don't try to autocomplete
         * if the query only contains spaces.
         */
        const queryArray = searchQuery.split(splitSearchQuerySelector);
        const prefix = queryArray[queryArray.length - 1];
        const completionParams = {
          projectId,
          prefix: prefix,
          count: completionsCount
        };

        if (!!prefix) {
          fetchAutocompletions(completionParams);
          return;
        }
        setAutocompletions(null);
      }
    },
    [autocompletionOptions, projectId, searchClient]
  );

  const handleFetchAggregations = useCallback(
    async (searchParameters): Promise<void> => {
      // since we only call this when the aggregation changes, we can safely reset the filter
      const searchParamsWithoutFilter = { ...searchParameters, filter: '' };
      setSearchParameters(searchParamsWithoutFilter);
      const searchParametersWithAggregationDefaults = {
        ...searchParamsWithoutFilter,
        ...aggregationQueryDefaults
      };
      const { result } = await searchClient.query(searchParametersWithAggregationDefaults);
      if (result) {
        const { aggregations } = result;
        setAggregationResults(aggregations || null);
      }
    },
    [searchClient, setSearchParameters]
  );

  const handleSetSelectedResult = (overrideSelectedResult: SelectedResult) => {
    const newSelectedResult: SelectedResult = !overrideSelectedResult.document
      ? emptySelectedResult
      : overrideSelectedResult;
    if (!newSelectedResult.element && newSelectedResult.elementType) {
      newSelectedResult.elementType = null;
    }
    if (!newSelectedResult.elementType && newSelectedResult.element) {
      newSelectedResult.element = null;
    }
    setSelectedResult(newSelectedResult);
  };

  const [fetchDocumentsResponseStore, { fetchDocuments }] = useFetchDocumentsApi(
    { ...fetchDocumentsResponseStoreDefaults.parameters, projectId },
    searchClient
  );

  const handleFetchDocuments = useCallback(
    (filterString: string, searchResponse: DiscoveryV2.QueryResponse | null): void => {
      fetchDocuments(filterString, filteredResponse => {
        if (searchResponse && searchResponse.results && filteredResponse.results) {
          setSearchResponse({
            ...searchResponse,
            matching_results:
              (searchResponse.matching_results as number) + filteredResponse.results.length,
            results: [...searchResponse.results, ...filteredResponse.results]
          });
        } else if (!searchResponse) {
          setSearchResponse(filteredResponse);
        }
      });
    },
    [fetchDocuments, setSearchResponse]
  );

  const api = useMemo((): SearchApiIFC => {
    return {
      performSearch: handleSearch,
      fetchAggregations: handleFetchAggregations,
      fetchAutocompletions: handleFetchAutocompletions,
      fetchDocuments: handleFetchDocuments,
      setSelectedResult: handleSetSelectedResult,
      setAutocompletionOptions,
      setSearchParameters,
      setIsResultsPaginationComponentHidden
    };
  }, [
    handleFetchAggregations,
    handleFetchAutocompletions,
    handleSearch,
    handleFetchDocuments,
    setSearchParameters
  ]);

  const state = useDeepCompareMemo(() => {
    return {
      aggregationResults,
      autocompletionStore,
      fetchDocumentsResponseStore,
      searchResponseStore,
      selectedResult,
      collectionsResults,
      componentSettings,
      isResultsPaginationComponentHidden
    };
  }, [
    aggregationResults,
    autocompletionStore,
    fetchDocumentsResponseStore,
    searchResponseStore,
    selectedResult,
    collectionsResults,
    componentSettings,
    isResultsPaginationComponentHidden
  ]);

  return (
    <SearchApi.Provider value={api}>
      <SearchContext.Provider value={state}>{children}</SearchContext.Provider>
    </SearchApi.Provider>
  );
};
