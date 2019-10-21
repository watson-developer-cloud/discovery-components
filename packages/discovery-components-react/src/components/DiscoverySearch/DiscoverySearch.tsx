import * as React from 'react';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import pick from 'lodash/pick';

export type SearchParams = Omit<
  DiscoveryV1.QueryParams,
  'project_id' | 'logging_opt_out' | 'headers' | 'return_response'
>;

export interface DiscoverySearchProps {
  /**
   * Search client
   */
  searchClient: Pick<DiscoveryV1, 'query' | 'getAutocompletion' | 'listCollections'>;
  /**
   * Project ID
   */
  projectId: string;
  /**
   * Aggregation results used to override internal aggregation search results state
   */
  aggregationResults?: DiscoveryV1.QueryAggregation;
  /**
   * Search response used to override internal search results state
   */
  searchResults?: DiscoveryV1.QueryResponse;
  /**
   * Query parameters used to override internal query parameters state
   */
  queryParameters?: SearchParams;
  /**
   * selectedResult is used to override internal selectedResult state
   */
  selectedResult?: DiscoveryV1.QueryResult | null;
  /**
   * Autocompletion suggestions for the searchInput
   */
  autocompletionResults?: DiscoveryV1.Completions;
  /**
   * collectionsResults is used to override internal collections result state
   */
  collectionsResults?: DiscoveryV1.ListCollectionsResponse;
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

export interface SearchContextIFC {
  onSearch: () => Promise<void>;
  onFetchAutoCompletions: (nlq: string) => Promise<void>;
  onRefinementsMount: () => Promise<void>;
  onSelectResult: (result: DiscoveryV1.QueryResult) => Promise<void>;
  onUpdateAutoCompletionOptions: (autoCompletionOptions: AutocompletionOptions) => Promise<void>;
  onUpdateQueryOptions: (queryOptions: SearchParams) => Promise<void>;
  aggregationResults: DiscoveryV1.QueryAggregation;
  searchResults: DiscoveryV1.QueryResponse;
  searchParameters: DiscoveryV1.QueryParams;
  collectionsResults: DiscoveryV1.ListCollectionsResponse;
  selectedResult: DiscoveryV1.QueryResult | null;
  autocompletionResults: DiscoveryV1.Completions;
}

export const searchContextDefaults = {
  onSearch: (): Promise<void> => Promise.resolve(),
  onFetchAutoCompletions: (): Promise<void> => Promise.resolve(),
  onRefinementsMount: (): Promise<void> => Promise.resolve(),
  onUpdateAutoCompletionOptions: (): Promise<void> => Promise.resolve(),
  onUpdateQueryOptions: (): Promise<void> => Promise.resolve(),
  onSelectResult: (): Promise<void> => Promise.resolve(),
  aggregationResults: {},
  searchResults: {},
  searchParameters: {
    project_id: ''
  },
  selectedResult: null,
  autocompletionResults: {},
  collectionsResults: {}
};

export const SearchContext = React.createContext<SearchContextIFC>(searchContextDefaults);

export const DiscoverySearch: React.SFC<DiscoverySearchProps> = ({
  searchClient,
  projectId,
  aggregationResults,
  searchResults,
  queryParameters,
  selectedResult,
  autocompletionResults,
  collectionsResults,
  children
}) => {
  const [stateSearchResults, setStateSearchResults] = React.useState<DiscoveryV1.QueryResponse>(
    searchResults || {}
  );
  const [stateAggregationResults, setStateAggregationResults] = React.useState<
    DiscoveryV1.QueryAggregation
  >(aggregationResults || {});
  const [stateCollectionsResults, setStateCollectionsResults] = React.useState<
    DiscoveryV1.ListCollectionsResponse
  >(collectionsResults || {});
  const [searchParameters, setSearchParameters] = React.useState<DiscoveryV1.QueryParams>({
    project_id: projectId,
    highlight: true,
    ...queryParameters
  });
  const [autocompletionResultsState, setAutocompletionResultsState] = React.useState<
    DiscoveryV1.Completions
  >(autocompletionResults || {});
  const [
    selectedResultState,
    setSelectedResultState
  ] = React.useState<DiscoveryV1.QueryResult | null>(selectedResult || null);
  const [queryOptionsState, setQueryOptionsState] = React.useState<SearchParams>({});
  const [autocompletionOptionsState, setAutocompletionOptionsState] = React.useState<
    AutocompletionOptions
  >({});

  // when Discovery Search mounts, fetch info that multiple components rely on
  React.useEffect(() => {
    handleFetchCollections();
  }, []);

  React.useEffect(() => {
    const newSearchParameters = Object.assign({}, searchParameters, {
      project_id: projectId,
      ...queryParameters
    });
    setSearchParameters(newSearchParameters);
  }, [projectId, queryParameters]);

  React.useEffect(() => {
    setStateSearchResults(searchResults || stateSearchResults);
  }, [searchResults]);

  React.useEffect(() => {
    setStateAggregationResults(aggregationResults || stateAggregationResults);
  }, [aggregationResults]);

  React.useEffect(() => {
    setStateCollectionsResults(collectionsResults || stateCollectionsResults);
  }, [collectionsResults]);

  React.useEffect(() => {
    setSelectedResultState(selectedResult || selectedResultState);
  }, [selectedResult]);

  React.useEffect(() => {
    setAutocompletionResultsState(autocompletionResults || autocompletionResultsState);
  }, [autocompletionResults]);

  const handleFetchRefinements = async (): Promise<void> => {
    const { aggregations } = await searchClient.query(
      Object.assign(searchParameters, queryOptionsState)
    );
    setStateAggregationResults({ aggregations });
    return Promise.resolve();
  };

  async function handleFetchCollections(): Promise<void> {
    const collectionsResults = await searchClient.listCollections(
      pick(searchParameters, 'project_id')
    );
    setStateCollectionsResults(collectionsResults);
    return Promise.resolve();
  }

  const handleUpdateQueryOptions = (queryOptions: SearchParams): Promise<void> => {
    setQueryOptionsState(Object.assign(queryOptionsState, queryOptions));
    return Promise.resolve();
  };

  const handleUpdateAutocompletionOptions = (
    autocompletionOptions: AutocompletionOptions
  ): Promise<void> => {
    setAutocompletionOptionsState(Object.assign(autocompletionOptionsState, autocompletionOptions));
    return Promise.resolve();
  };

  const handleFetchAutocompletions = async (nlq: string): Promise<void> => {
    const {
      splitSearchQuerySelector,
      updateAutocompletions: updateAutocomplete,
      completionsCount,
      minCharsToAutocomplete
    } = autocompletionOptionsState;
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
      const queryArray = nlq.split(splitSearchQuerySelector);
      const prefix = queryArray[queryArray.length - 1];
      const autocompletionParams = {
        project_id: searchParameters.project_id,
        prefix: prefix
      };

      if (!!prefix && prefix !== '' && prefix.length >= minCharsToAutocomplete) {
        const autocompletions: DiscoveryV1.Completions = await searchClient.getAutocompletion(
          autocompletionParams
        );
        setAutocompletionResultsState(autocompletions);
        return Promise.resolve();
      }
    }

    setAutocompletionResultsState({});
    return Promise.resolve();
  };

  const handleSelectResult = (result: DiscoveryV1.QueryResult): Promise<void> => {
    setSelectedResultState(result);
    return Promise.resolve();
  };

  const handleSearch = async (): Promise<void> => {
    const searchResults: DiscoveryV1.QueryResponse = await searchClient.query(
      Object.assign(searchParameters, queryOptionsState)
    );
    setStateSearchResults(searchResults);
    const { aggregations } = searchResults;
    setStateAggregationResults({ aggregations });
  };

  return (
    <SearchContext.Provider
      value={{
        onSearch: handleSearch,
        onFetchAutoCompletions: handleFetchAutocompletions,
        onRefinementsMount: handleFetchRefinements,
        onSelectResult: handleSelectResult,
        onUpdateAutoCompletionOptions: handleUpdateAutocompletionOptions,
        onUpdateQueryOptions: handleUpdateQueryOptions,
        aggregationResults: stateAggregationResults,
        searchResults: stateSearchResults,
        searchParameters,
        selectedResult: selectedResultState,
        autocompletionResults: autocompletionResultsState,
        collectionsResults: stateCollectionsResults
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
