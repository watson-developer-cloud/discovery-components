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
}

export interface SearchContextIFC {
  onSearch: () => Promise<void>;
  onUpdateNaturalLanguageQuery: (nlq: string) => Promise<void>;
  onUpdateResultsPagination: (offset: number) => Promise<void>;
  searchResults: DiscoveryV1.QueryResponse;
  searchParameters: DiscoveryV1.QueryParams;
}

export const SearchContext = React.createContext<SearchContextIFC>({
  onSearch: (): Promise<void> => Promise.resolve(),
  onUpdateNaturalLanguageQuery: (): Promise<void> => Promise.resolve(),
  onUpdateResultsPagination: (): Promise<void> => Promise.resolve(),
  searchResults: {},
  searchParameters: {
    environment_id: '',
    collection_id: ''
  }
});

export const DiscoverySearch: React.SFC<DiscoverySearchProps> = ({
  searchClient,
  environmentId,
  collectionId,
  searchResults,
  queryParameters,
  children
}) => {
  const [stateSearchResults, setStateSearchResults] = React.useState<DiscoveryV1.QueryResponse>(
    searchResults || {}
  );
  const [searchParameters, setSearchParameters] = React.useState<DiscoveryV1.QueryParams>({
    environment_id: environmentId || 'default',
    collection_id: collectionId
  });

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
  const handleSearch = async (): Promise<void> => {
    const searchResults: DiscoveryV1.QueryResponse = await searchClient.query(searchParameters);
    setStateSearchResults(searchResults);
  };
  return (
    <SearchContext.Provider
      value={{
        onSearch: handleSearch,
        onUpdateNaturalLanguageQuery: handleUpdateNaturalLanguageQuery,
        onUpdateResultsPagination: handleResultsPagination,
        searchResults: stateSearchResults,
        searchParameters
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
