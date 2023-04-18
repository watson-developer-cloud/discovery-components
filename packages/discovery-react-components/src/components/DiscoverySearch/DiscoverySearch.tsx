import React, { createContext, FC, useEffect, useState, useCallback } from 'react';
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
  useAutocompleteApi,
  useFieldsApi,
  FieldsStore,
  useGlobalAggregationsApi,
  GlobalAggregationsResponseStore
} from 'utils/useDataApi';
import { DocumentProvider, SearchClient, SearchParams } from './types';
import { withErrorBoundary } from 'react-error-boundary';
import { FallbackComponent } from 'utils/FallbackComponent';
import onErrorCallback from 'utils/onErrorCallback';
import { buildAggregationQuery } from 'components/SearchFacets/utils/buildAggregationQuery';
import {
  QueryAggregationWithName,
  isQueryAggregationWithName
} from 'components/SearchFacets/utils/searchFacetInterfaces';
import { deprecateReturnFields } from 'utils/deprecation';

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

export const emptySelectedResult = {
  document: null,
  element: null,
  elementType: null
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
  fetchDocuments: (
    filterString: string,
    collections?: string[],
    searchResponse?: DiscoveryV2.QueryResponse
  ) => void;
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
  fetchFields: () => void;
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
  setIsResultsPaginationComponentHidden: (): void => {},
  fetchFields: (): Promise<void> => Promise.resolve()
};

export const searchResponseStoreDefaults: SearchResponseStore = {
  parameters: {
    projectId: ''
  },
  data: null,
  isLoading: false,
  isError: false,
  error: null
};

const aggregationQueryDefaults: Partial<DiscoveryV2.QueryParams> = {
  count: 0,
  filter: '',
  passages: {
    enabled: false
  },
  tableResults: {
    enabled: false
  }
};

export const globalAggregationsResponseStoreDefaults: GlobalAggregationsResponseStore = {
  parameters: {
    projectId: '',
    ...aggregationQueryDefaults
  },
  data: null,
  isLoading: false,
  isError: false,
  error: null
};

export const fetchDocumentsResponseStoreDefaults: FetchDocumentsResponseStore = {
  parameters: {
    projectId: '',
    _return: [],
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
  isError: false,
  error: null
};

export const autocompletionStoreDefaults: AutocompleteStore = {
  parameters: {
    projectId: '',
    prefix: ''
  },
  data: null,
  isLoading: false,
  isError: false,
  error: null
};

const fieldsStoreDefaults: FieldsStore = {
  parameters: {
    projectId: ''
  },
  data: null,
  isLoading: false,
  isError: false,
  error: null
};

export const searchContextDefaults = {
  searchResponseStore: searchResponseStoreDefaults,
  globalAggregationsResponseStore: globalAggregationsResponseStoreDefaults,
  fetchDocumentsResponseStore: fetchDocumentsResponseStoreDefaults,
  selectedResult: emptySelectedResult,
  autocompletionStore: autocompletionStoreDefaults,
  isResultsPaginationComponentHidden: false,
  fieldsStore: fieldsStoreDefaults
};

export const SearchApi = createContext<SearchApiIFC>(searchApiDefaults);
export const SearchContext = createContext<SearchContextIFC>(searchContextDefaults);

const DiscoverySearch: FC<DiscoverySearchProps> = ({
  searchClient,
  projectId,
  documentProvider,
  overrideAggregationResults,
  overrideSearchResults,
  overrideQueryParameters,
  overrideSelectedResult = emptySelectedResult,
  overrideAutocompletionResults,
  overrideCollectionsResults,
  overrideComponentSettings,
  children
}) => {
  const [aggregationResults, setAggregationResults] = useState<
    DiscoveryV2.QueryAggregation[] | QueryAggregationWithName[] | undefined | null
  >(null);
  const [collectionsResults, setCollectionsResults] = useState<
    DiscoveryV2.ListCollectionsResponse | undefined
  >(overrideCollectionsResults);
  const [autocompletionOptions, setAutocompletionOptions] = useState<AutocompletionOptions>({});
  const [selectedResult, setSelectedResult] = useState<SelectedResult>(overrideSelectedResult);
  const [componentSettings, setComponentSettings] = useState<
    DiscoveryV2.ComponentSettingsResponse | undefined
  >(overrideComponentSettings);
  const [isResultsPaginationComponentHidden, setIsResultsPaginationComponentHidden] =
    useState<boolean>();

  const [searchResponseStore, { setSearchResponse, setSearchParameters, performSearch }] =
    useSearchResultsApi(
      { projectId, ...deprecateReturnFields(overrideQueryParameters) },
      searchClient,
      overrideSearchResults
    );

  const [
    globalAggregationsResponseStore,
    {
      setGlobalAggregationsResponse,
      fetchGlobalAggregations,
      fetchGlobalAggregationsWithoutStoring
    }
  ] = useGlobalAggregationsApi(
    { ...globalAggregationsResponseStoreDefaults.parameters, projectId },
    searchClient,
    overrideAggregationResults
  );

  const fetchTypeForTopEntitiesAggregation = useCallback(
    async (
      aggregationResults: QueryAggregationWithName[],
      searchParams: DiscoveryV2.QueryParams
    ) => {
      // TODO make this only run if aggregationResults doesn't already have type for top entities aggregation in the results
      if (isQueryAggregationWithName(aggregationResults)) {
        const updatedAggQuery = buildAggregationQuery(aggregationResults);
        const updatedSearchParameters = {
          ...searchParams,
          aggregation: updatedAggQuery
        };
        fetchGlobalAggregations(updatedSearchParameters);
      }
    },
    [fetchGlobalAggregations]
  );

  const handleSearch = useCallback(
    async (
      backwardsCompatibleQueryParams: DiscoveryV2.QueryParams & { returnFields?: string[] },
      resetAggregations = true
    ): Promise<void> => {
      let aggregationsFetched = false;
      const searchParameters = deprecateReturnFields(
        backwardsCompatibleQueryParams
      ) as DiscoveryV2.QueryParams;
      setSearchParameters(searchParameters);

      // TODO proper fix is to have any caller of handleSearch that needs aggregations
      // to call handleFetchAggregations instead
      if (resetAggregations && searchParameters.filter !== '') {
        aggregationsFetched = true;
        fetchGlobalAggregationsWithoutStoring(
          {
            ...searchParameters,
            ...aggregationQueryDefaults,
            filter: ''
          },
          async aggregations => {
            fetchTypeForTopEntitiesAggregation(aggregations, searchParameters);
          }
        );
      }

      performSearch(async result => {
        if (!aggregationsFetched && resetAggregations && result && result.aggregations) {
          fetchTypeForTopEntitiesAggregation(result.aggregations, searchParameters);
        }
      });
    },
    [
      fetchGlobalAggregationsWithoutStoring,
      fetchTypeForTopEntitiesAggregation,
      performSearch,
      setSearchParameters
    ]
  );

  const [autocompletionStore, { fetchAutocompletions, setAutocompletions }] = useAutocompleteApi(
    { projectId, count: autocompletionOptions.completionsCount, prefix: '' },
    searchClient,
    overrideAutocompletionResults
  );

  // Keep aggregationResults in sync with globalAggregationsResponseStore data
  // to support it until deprecated in next major release
  useDeepCompareEffect(() => {
    setAggregationResults(globalAggregationsResponseStore.data);
  }, [globalAggregationsResponseStore.data]);

  useDeepCompareEffect(() => {
    setSearchResponse(overrideSearchResults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overrideSearchResults]);

  useDeepCompareEffect(() => {
    setSearchParameters(currentSearchParameters => {
      return {
        ...currentSearchParameters,
        projectId,
        ...deprecateReturnFields(overrideQueryParameters)
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, overrideQueryParameters]);

  useDeepCompareEffect(() => {
    setGlobalAggregationsResponse(overrideAggregationResults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overrideAggregationResults]);

  useDeepCompareEffect(() => {
    setCollectionsResults(overrideCollectionsResults);
  }, [overrideCollectionsResults]);

  useDeepCompareEffect(() => {
    setSelectedResult(overrideSelectedResult);
  }, [overrideSelectedResult]);

  useDeepCompareEffect(() => {
    setAutocompletions(overrideAutocompletionResults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overrideAutocompletionResults]);

  useDeepCompareEffect(() => {
    setComponentSettings(overrideComponentSettings);
  }, [overrideComponentSettings]);

  useEffect(() => {
    async function fetchCollections(): Promise<void> {
      try {
        const { result } = await searchClient.listCollections({ projectId });
        setCollectionsResults(result);
      } catch (err) {
        console.error('Error fetching collections', err);
      }
    }
    async function getComponentSettings(): Promise<void> {
      try {
        const { result } = await searchClient.getComponentSettings({ projectId });
        setComponentSettings(result);
      } catch (err) {
        console.error('Error fetching component settings', err);
      }
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
          prefix,
          count: completionsCount
        };

        if (!!prefix) {
          fetchAutocompletions(completionParams);
          return;
        }
        setAutocompletions(undefined);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [autocompletionOptions, projectId]
  );

  const handleFetchAggregations = useCallback(
    async (
      backwardsCompatibleQueryParams: DiscoveryV2.QueryParams & { returnFields?: [] }
    ): Promise<void> => {
      const aggregationsSearchParameters = deprecateReturnFields(
        backwardsCompatibleQueryParams
      ) as DiscoveryV2.QueryParams;
      // since we only call this when the aggregation changes, we can safely reset the filter
      setSearchParameters(prevSearchParams => {
        return { ...prevSearchParams, filter: '' };
      });
      fetchGlobalAggregationsWithoutStoring(aggregationsSearchParameters, async aggregations => {
        fetchTypeForTopEntitiesAggregation(aggregations, aggregationsSearchParameters);
      });
    },
    [fetchGlobalAggregationsWithoutStoring, fetchTypeForTopEntitiesAggregation, setSearchParameters]
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
    (
      filterString: string,
      collections?: string[],
      searchResponse?: DiscoveryV2.QueryResponse
    ): void => {
      fetchDocuments(filterString, collections || [], filteredResponse => {
        if (searchResponse && searchResponse.results && filteredResponse.results) {
          const results = [...searchResponse.results];
          const filteredResults = [...filteredResponse.results];

          // replace existing doc data in `searchResponse` with new filtered response data
          while (filteredResults.length) {
            const filteredResult = filteredResults.pop();
            if (!filteredResult) {
              continue;
            }

            const idx = results.findIndex(
              res =>
                res.document_id === filteredResult?.document_id &&
                res.result_metadata.collection_id === filteredResult.result_metadata.collection_id
            );

            if (idx !== -1) {
              // merge results, since filteredResult may not contain all fields from a previous
              // query (like passages)
              const mergedResult = {
                ...results[idx],
                ...filteredResult
              };
              results.splice(idx, 1, mergedResult);
            } else {
              results.push(filteredResult);
            }
          }

          setSearchResponse({
            ...searchResponse,
            matching_results: results.length,
            results
          });
        } else if (!searchResponse) {
          setSearchResponse(filteredResponse);
        }
      });
    },
    [fetchDocuments, setSearchResponse]
  );

  const [fieldsStore, { fetchFields }] = useFieldsApi({ projectId }, searchClient);

  const handleFetchFields = useCallback(() => {
    fetchFields();
  }, [fetchFields]);

  const api = {
    performSearch: handleSearch,
    fetchAggregations: handleFetchAggregations,
    fetchAutocompletions: handleFetchAutocompletions,
    fetchDocuments: handleFetchDocuments,
    setSelectedResult: handleSetSelectedResult,
    setAutocompletionOptions,
    setSearchParameters,
    setIsResultsPaginationComponentHidden,
    fetchFields: handleFetchFields
  };

  const state = useDeepCompareMemo(() => {
    return {
      aggregationResults,
      autocompletionStore,
      fetchDocumentsResponseStore,
      searchResponseStore,
      globalAggregationsResponseStore,
      selectedResult,
      collectionsResults,
      componentSettings,
      isResultsPaginationComponentHidden,
      fieldsStore,
      documentProvider
    };
  }, [
    aggregationResults,
    autocompletionStore,
    fetchDocumentsResponseStore,
    searchResponseStore,
    globalAggregationsResponseStore,
    selectedResult,
    collectionsResults,
    componentSettings,
    isResultsPaginationComponentHidden,
    fieldsStore,
    documentProvider
  ]);

  return (
    <SearchApi.Provider value={api}>
      <SearchContext.Provider value={state}>{children}</SearchContext.Provider>
    </SearchApi.Provider>
  );
};

export default withErrorBoundary(
  DiscoverySearch,
  FallbackComponent('DiscoverySearch'),
  onErrorCallback
);
