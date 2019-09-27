import * as React from 'react';
import DiscoveryV1 from 'ibm-watson/discovery/v1';

export interface DiscoverySearchProps {
  /**
   * Search client
   */
  searchClient: Pick<DiscoveryV1, 'query'>;
  /**
   * Environment ID for collection
   */
  environmentId: string;
  /**
   * Collection ID for collection
   */
  collectionId: string;
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
    'environment_id' | 'collection_id' | 'logging_opt_out' | 'headers' | 'return_response'
  >;
  /**
   * selectedResult is used to override internal selectedResult state
   */
  selectedResult?: DiscoveryV1.QueryResult;
}

export interface SearchContextIFC {
  onSearch: () => Promise<void>;
  onLoadAggregationResults: () => Promise<void>;
  onUpdateAggregationQuery: (aggregationQuery: string) => Promise<void>;
  onUpdateNaturalLanguageQuery: (nlq: string) => Promise<void>;
  onUpdateResultsPagination: (offset: number) => Promise<void>;
  onSelectResult: (result: DiscoveryV1.QueryResult) => Promise<void>;
  aggregationResults: DiscoveryV1.QueryAggregation;
  searchResults: DiscoveryV1.QueryResponse;
  searchParameters: DiscoveryV1.QueryParams;
  selectedResult: DiscoveryV1.QueryResult;
}

export const SearchContext = React.createContext<SearchContextIFC>({
  onSearch: (): Promise<void> => Promise.resolve(),
  onLoadAggregationResults: (): Promise<void> => Promise.resolve(),
  onUpdateAggregationQuery: (): Promise<void> => Promise.resolve(),
  onUpdateNaturalLanguageQuery: (): Promise<void> => Promise.resolve(),
  onUpdateResultsPagination: (): Promise<void> => Promise.resolve(),
  onSelectResult: (): Promise<void> => Promise.resolve(),
  aggregationResults: {},
  searchResults: {},
  searchParameters: {
    environment_id: '',
    collection_id: ''
  },
  selectedResult: {}
});

export const DiscoverySearch: React.SFC<DiscoverySearchProps> = ({
  searchClient,
  environmentId,
  collectionId,
  aggregationResults,
  searchResults,
  queryParameters,
  selectedResult,
  children
}) => {
  const [stateSearchResults, setStateSearchResults] = React.useState<DiscoveryV1.QueryResponse>(
    searchResults || {}
  );
  const [stateAggregationResults, setStateAggregationResults] = React.useState<
    DiscoveryV1.QueryAggregation
  >(aggregationResults || {});
  const [searchParameters, setSearchParameters] = React.useState<DiscoveryV1.QueryParams>({
    environment_id: environmentId || 'default',
    collection_id: collectionId
  });
  const [selectedResultState, setSelectedResultState] = React.useState<DiscoveryV1.QueryResult>(
    selectedResult || {}
  );

  React.useEffect(() => {
    const newSearchParameters = Object.assign({}, searchParameters, {
      environment_id: environmentId || 'default',
      collection_id: collectionId
    });
    setSearchParameters(newSearchParameters);
  }, [environmentId, collectionId]);

  React.useEffect(() => {
    const newSearchParameters = Object.assign({}, searchParameters, {
      ...queryParameters
    });
    setSearchParameters(newSearchParameters);
  }, [queryParameters]);

  React.useEffect(() => {
    setStateSearchResults(searchResults || stateSearchResults);
  }, [searchResults]);

  React.useEffect(() => {
    setStateAggregationResults(aggregationResults || stateAggregationResults);
  }, [aggregationResults]);

  React.useEffect(() => {
    setSelectedResultState(selectedResult || selectedResultState);
  }, [selectedResult]);

  const handleLoadAggregationResults = async (): Promise<void> => {
    const { aggregations }: DiscoveryV1.QueryResponse = await searchClient.query(searchParameters);
    setStateAggregationResults({ aggregations });
  };
  const handleUpdateAggregationQuery = (aggregationQuery: string): Promise<void> => {
    searchParameters.aggregation = aggregationQuery;
    setSearchParameters(searchParameters);
    return Promise.resolve();
  };
  const handleUpdateNaturalLanguageQuery = (nlq: string): Promise<void> => {
    searchParameters.natural_language_query = nlq;
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
        onLoadAggregationResults: handleLoadAggregationResults,
        onUpdateAggregationQuery: handleUpdateAggregationQuery,
        onUpdateNaturalLanguageQuery: handleUpdateNaturalLanguageQuery,
        onUpdateResultsPagination: handleResultsPagination,
        onSelectResult: handleSelectResult,
        aggregationResults: stateAggregationResults,
        searchResults: stateSearchResults,
        searchParameters,
        selectedResult: selectedResultState
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
