import React, { useState } from 'react';
import DiscoveryV1 from 'ibm-watson/discovery/v1';

interface DiscoverySearchProps {
  searchClient: Pick<DiscoveryV1, 'query'>;
  environmentId: string;
  collectionId: string;
}

interface SearchContext {
  onSearch: () => Promise<void>;
  onUpdateNaturalLanguageQuery: (nlq: string) => Promise<void>;
  searchResults: DiscoveryV1.QueryResponse;
  searchParameters: DiscoveryV1.QueryParams;
}

export const SearchContext = React.createContext<SearchContext>({
  onSearch: (): Promise<void> => Promise.resolve(),
  onUpdateNaturalLanguageQuery: (): Promise<void> => Promise.resolve(),
  searchResults: {},
  searchParameters: {
    environment_id: 'foo',
    collection_id: 'bar'
  }
});

export const DiscoverySearch: React.SFC<DiscoverySearchProps> = ({
  searchClient,
  environmentId,
  collectionId,
  children
}) => {
  const [searchResults, setSearchResults] = useState<DiscoveryV1.QueryResponse>({});
  const [searchParameters, setSearchParameters] = useState<DiscoveryV1.QueryParams>({
    environment_id: environmentId || 'default',
    collection_id: collectionId
  });
  const handleUpdateNaturalLanguageQuery = (nlq: string): Promise<void> => {
    searchParameters.natural_language_query = nlq;
    setSearchParameters(searchParameters);
    return Promise.resolve();
  };
  const handleSearch = async (): Promise<void> => {
    const searchResults: DiscoveryV1.QueryResponse = await searchClient.query(searchParameters);
    setSearchResults(searchResults);
  };
  return (
    <SearchContext.Provider
      value={{
        onSearch: handleSearch,
        onUpdateNaturalLanguageQuery: handleUpdateNaturalLanguageQuery,
        searchResults,
        searchParameters
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
