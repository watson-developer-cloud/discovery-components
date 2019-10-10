import * as React from 'react';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';

export interface DiscoverySearchProps {
  /**
   * Search client
   */
  searchClient: Pick<DiscoveryV1, 'query' | 'getAutocompletion'>;
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
  queryParameters?: Omit<
    DiscoveryV1.QueryParams,
    'project_id' | 'logging_opt_out' | 'headers' | 'return_response'
  >;
  /**
   * selectedResult is used to override internal selectedResult state
   */
  selectedResult?: DiscoveryV1.QueryResult;
  /**
   * Autocompletion suggestions for the searchInput
   */
  completionResults?: DiscoveryV1.Completions;
}

export interface SearchContextIFC {
  onSearch: () => Promise<void>;
  onRefinementsMount: () => Promise<void>;
  onUpdateAggregationQuery: (aggregationQuery: string) => Promise<void>;
  onUpdateFilter: (filter: string) => Promise<void>;
  onUpdateNaturalLanguageQuery: (nlq: string, splitSearchQuerySelector?: string) => Promise<void>;
  onUpdateResultsPagination: (offset: number) => Promise<void>;
  onSelectResult: (result: DiscoveryV1.QueryResult) => Promise<void>;
  aggregationResults: DiscoveryV1.QueryAggregation;
  searchResults: DiscoveryV1.QueryResponse;
  searchParameters: DiscoveryV1.QueryParams;
  selectedResult: DiscoveryV1.QueryResult;
  completionResults: DiscoveryV1.Completions;
}

export const SearchContext = React.createContext<SearchContextIFC>({
  onSearch: (): Promise<void> => Promise.resolve(),
  onRefinementsMount: (): Promise<void> => Promise.resolve(),
  onUpdateAggregationQuery: (): Promise<void> => Promise.resolve(),
  onUpdateFilter: (): Promise<void> => Promise.resolve(),
  onUpdateNaturalLanguageQuery: (): Promise<void> => Promise.resolve(),
  onUpdateResultsPagination: (): Promise<void> => Promise.resolve(),
  onSelectResult: (): Promise<void> => Promise.resolve(),
  aggregationResults: {},
  searchResults: {},
  searchParameters: {
    project_id: ''
  },
  selectedResult: {},
  completionResults: {}
});

export const DiscoverySearch: React.SFC<DiscoverySearchProps> = ({
  searchClient,
  projectId,
  aggregationResults,
  searchResults,
  queryParameters,
  selectedResult,
  completionResults,
  children
}) => {
  const [stateSearchResults, setStateSearchResults] = React.useState<DiscoveryV1.QueryResponse>(
    searchResults || {}
  );
  const [stateAggregationResults, setStateAggregationResults] = React.useState<
    DiscoveryV1.QueryAggregation
  >(aggregationResults || {});
  const [searchParameters, setSearchParameters] = React.useState<DiscoveryV1.QueryParams>({
    project_id: projectId,
    highlight: true,
    ...queryParameters
  });
  const [completionResultsState, setCompletionResultsState] = React.useState<
    DiscoveryV1.Completions
  >(completionResults || {});
  const [selectedResultState, setSelectedResultState] = React.useState<DiscoveryV1.QueryResult>(
    selectedResult || {}
  );

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
    setSelectedResultState(selectedResult || selectedResultState);
  }, [selectedResult]);

  React.useEffect(() => {
    setCompletionResultsState(completionResults || completionResultsState);
  }, [completionResults]);

  // helper method that handles the logic to fetch completions whenever the search query is updated
  const getCompletions = async (
    searchQuery: string,
    splitSearchQuerySelector: string
  ): Promise<void> => {
    /**
     * If user clicks space consider searching a new word. Also don't try to autocomplete
     * if the query only contains spaces.
     */
    const queryArray = searchQuery.split(splitSearchQuerySelector);
    const prefix = queryArray[queryArray.length - 1];
    const completionParams = {
      project_id: searchParameters.project_id,
      prefix: prefix
    };

    if (!!prefix) {
      const completions: DiscoveryV1.Completions = await searchClient.getAutocompletion(
        completionParams
      );
      setCompletionResultsState(completions);
    } else {
      setCompletionResultsState({});
    }
  };

  const handleRefinementsMount = async (): Promise<void> => {
    const { aggregations }: DiscoveryV1.QueryResponse = await searchClient.query(searchParameters);
    setStateAggregationResults({ aggregations });
    return Promise.resolve();
  };
  const handleUpdateAggregationQuery = (aggregationQuery: string): Promise<void> => {
    searchParameters.aggregation = aggregationQuery;
    setSearchParameters(searchParameters);
    return Promise.resolve();
  };
  const handleUpdateNaturalLanguageQuery = (
    nlq: string,
    splitSearchQuerySelector?: string
  ): Promise<void> => {
    if (!!splitSearchQuerySelector) {
      getCompletions(nlq, splitSearchQuerySelector);
    }
    searchParameters.natural_language_query = nlq;
    searchParameters.filter = '';
    setSearchParameters(searchParameters);
    return Promise.resolve();
  };
  const handleUpdateFilter = (filter: string): Promise<void> => {
    searchParameters.filter = filter;
    setSearchParameters(searchParameters);
    return Promise.resolve();
  };
  const handleResultsPagination = (offset: number): Promise<void> => {
    searchParameters.offset = offset;
    setSearchParameters(searchParameters);
    return Promise.resolve();
  };
  const handleSelectResult = (result: DiscoveryV1.QueryResult): Promise<void> => {
    setSelectedResultState(result);
    return Promise.resolve();
  };
  const handleSearch = async (): Promise<void> => {
    const searchResults: DiscoveryV1.QueryResponse = await searchClient.query(searchParameters);
    setStateSearchResults(searchResults);
    const { aggregations } = searchResults;
    setStateAggregationResults({ aggregations });
  };
  return (
    <SearchContext.Provider
      value={{
        onSearch: handleSearch,
        onRefinementsMount: handleRefinementsMount,
        onUpdateAggregationQuery: handleUpdateAggregationQuery,
        onUpdateFilter: handleUpdateFilter,
        onUpdateNaturalLanguageQuery: handleUpdateNaturalLanguageQuery,
        onUpdateResultsPagination: handleResultsPagination,
        onSelectResult: handleSelectResult,
        aggregationResults: stateAggregationResults,
        searchResults: stateSearchResults,
        searchParameters,
        selectedResult: selectedResultState,
        completionResults: completionResultsState
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
