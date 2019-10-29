import React, { createContext, FC, useEffect, useState, useCallback, useMemo } from 'react';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import {
  useDeepCompareEffect,
  useDeepCompareCallback,
  useDeepCompareMemo
} from '../../utils/useDeepCompareMemoize';

export type SearchParams = Omit<
  DiscoveryV1.QueryParams,
  'project_id' | 'logging_opt_out' | 'headers' | 'return_response'
>;

export interface DiscoverySearchProps {
  /**
   * Search client
   */
  searchClient: Pick<
    DiscoveryV1,
    'query' | 'getAutocompletion' | 'listCollections' | 'getComponentSettings'
  >;
  /**
   * Project ID
   */
  projectId: string;
  /**
   * Aggregation results used to override internal aggregation search results state
   */
  overrideAggregationResults?: DiscoveryV1.QueryAggregation;
  /**
   * Search response used to override internal search results state
   */
  overrideSearchResults?: DiscoveryV1.QueryResponse;
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
  overrideAutocompletionResults?: DiscoveryV1.Completions;
  /**
   * overrideCollectionsResults is used to override internal collections result state
   */
  overrideCollectionsResults?: DiscoveryV1.ListCollectionsResponse;
  /**
   * overrideComponentSettings is used to override internal collections result state
   */
  overrideComponentSettings?: DiscoveryV1.ComponentSettingsResponse;
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
  document: DiscoveryV1.QueryResult | null;
  element?: DiscoveryV1.QueryTableResult | DiscoveryV1.QueryResultPassage | null;
  elementType?: 'table' | 'passage' | null;
}

export const emptySelectedResult = {
  document: null,
  element: null,
  elementType: null
};

export interface SearchContextIFC {
  aggregationResults: DiscoveryV1.QueryAggregation | null;
  searchResponse: DiscoveryV1.QueryResponse | null;
  searchParameters: DiscoveryV1.QueryParams;
  collectionsResults: DiscoveryV1.ListCollectionsResponse | null;
  selectedResult: SelectedResult;
  autocompletionResults: DiscoveryV1.Completions | null;
  componentSettings: DiscoveryV1.ComponentSettingsResponse | null;
}

export interface SearchApiIFC {
  performSearch: (
    searchParameters: DiscoveryV1.QueryParams,
    resetAggregations?: boolean
  ) => Promise<void>;
  fetchAutocompletions: (nlq: string) => Promise<void>;
  fetchAggregations: (searchParameters: DiscoveryV1.QueryParams) => Promise<void>;
  setSelectedResult: (result: SelectedResult) => void;
  setAutocompletionOptions: (
    autoCompletionOptions: AutocompletionOptions | React.SetStateAction<AutocompletionOptions>
  ) => void;
  setSearchParameters: (
    searchParameters: DiscoveryV1.QueryParams | React.SetStateAction<DiscoveryV1.QueryParams>
  ) => void;
}

export const searchApiDefaults = {
  performSearch: (): Promise<void> => Promise.resolve(),
  fetchAutocompletions: (): Promise<void> => Promise.resolve(),
  fetchAggregations: (): Promise<void> => Promise.resolve(),
  fetchComponentSettings: (): Promise<void> => Promise.resolve(),
  setSelectedResult: (): void => {},
  setAutocompletionOptions: (): void => {},
  setSearchParameters: (): void => {}
};

export const searchContextDefaults = {
  aggregationResults: null,
  searchResponse: null,
  searchParameters: {
    project_id: ''
  },
  selectedResult: emptySelectedResult,
  autocompletionResults: null,
  collectionsResults: null,
  componentSettings: null
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
  const [searchResponse, setSearchResponse] = useState<DiscoveryV1.QueryResponse | null>(
    overrideSearchResults
  );
  const [aggregationResults, setAggregationResults] = useState<DiscoveryV1.QueryAggregation | null>(
    overrideAggregationResults
  );
  const [
    collectionsResults,
    setCollectionsResults
  ] = useState<DiscoveryV1.ListCollectionsResponse | null>(overrideCollectionsResults);
  const [searchParameters, setSearchParameters] = useState<DiscoveryV1.QueryParams>({
    project_id: projectId,
    ...overrideQueryParameters
  });
  const [
    autocompletionResults,
    setAutocompletionResults
  ] = useState<DiscoveryV1.Completions | null>(overrideAutocompletionResults);
  const [autocompletionOptions, setAutocompletionOptions] = useState<AutocompletionOptions>({});
  const [selectedResult, setSelectedResult] = useState<SelectedResult>(overrideSelectedResult);

  const [
    componentSettings,
    setComponentSettings
  ] = useState<DiscoveryV1.ComponentSettingsResponse | null>(overrideComponentSettings);

  useDeepCompareEffect(() => {
    setSearchParameters(currentSearchParameters => {
      return {
        ...currentSearchParameters,
        project_id: projectId,
        ...overrideQueryParameters
      };
    });
  }, [projectId, overrideQueryParameters]);

  useDeepCompareEffect(() => {
    setSearchResponse(overrideSearchResults);
  }, [overrideSearchResults]);

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
    setAutocompletionResults(overrideAutocompletionResults);
  }, [overrideAutocompletionResults]);

  useEffect(() => {
    async function fetchCollections(): Promise<void> {
      setCollectionsResults(await searchClient.listCollections({ project_id: projectId }));
    }
    async function getComponentSettings(): Promise<void> {
      setComponentSettings(await searchClient.getComponentSettings({ project_id: projectId }));
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
          project_id: projectId,
          prefix: prefix
        };

        if (!!prefix) {
          const completions: DiscoveryV1.Completions = await searchClient.getAutocompletion(
            completionParams
          );
          setAutocompletionResults(completions);
          return;
        }
        setAutocompletionResults(null);
      }
    },
    [autocompletionOptions, projectId, searchClient]
  );

  const handleFetchAggregations = useCallback(
    async (searchParameters): Promise<void> => {
      setSearchParameters(currentSearchParameters => {
        return {
          ...currentSearchParameters,
          aggregation: searchParameters.aggregation
        };
      });
      const aggregationsResults = await searchClient.query(searchParameters);
      if (aggregationsResults) {
        const { aggregations } = aggregationsResults;
        setAggregationResults({ aggregations });
      }
    },
    [searchClient]
  );

  const handleSearch = useCallback(
    async (searchParameters, resetAggregations = true): Promise<void> => {
      setSearchParameters(searchParameters);
      const searchResponse: DiscoveryV1.QueryResponse = await searchClient.query(searchParameters);
      setSearchResponse(searchResponse);
      if (searchResponse && resetAggregations) {
        const { aggregations } = searchResponse;
        setAggregationResults({ aggregations });
      }
    },
    [searchClient]
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

  const api = useMemo(() => {
    return {
      performSearch: handleSearch,
      fetchAggregations: handleFetchAggregations,
      fetchAutocompletions: handleFetchAutocompletions,
      setSelectedResult: handleSetSelectedResult,
      setAutocompletionOptions,
      setSearchParameters
    };
  }, [handleFetchAggregations, handleFetchAutocompletions, handleSearch]);

  const state = useDeepCompareMemo(() => {
    return {
      aggregationResults,
      autocompletionResults,
      searchParameters,
      searchResponse,
      selectedResult,
      collectionsResults,
      componentSettings
    };
  }, [
    autocompletionResults,
    aggregationResults,
    collectionsResults,
    autocompletionResults,
    searchParameters,
    searchResponse,
    selectedResult,
    componentSettings
  ]);

  return (
    <SearchApi.Provider value={api}>
      <SearchContext.Provider value={state}>{children}</SearchContext.Provider>
    </SearchApi.Provider>
  );
};
