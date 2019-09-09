import React, { useState } from 'react';
import DiscoveryV1 from 'ibm-watson/discovery/v1';

interface DiscoverySearchProps {
  searchClient: DiscoveryV1;
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

export const DiscoverySearch: React.SFC<DiscoverySearchProps> = props => {
  const [searchResults, setSearchResults] = useState<DiscoveryV1.QueryResponse>({});
  const [searchParameters, setSearchParameters] = useState<DiscoveryV1.QueryParams>({
    environment_id: props.environmentId || 'default',
    collection_id: props.collectionId
  });
  const handleUpdateNaturalLanguageQuery = (nlq: string): Promise<void> => {
    searchParameters.natural_language_query = nlq;
    setSearchParameters(searchParameters);
    return Promise.resolve();
  };
  const handleSearch = async () => {
    const searchResults: DiscoveryV1.QueryResponse = await props.searchClient.query(
      searchParameters
    );
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
      {props.children}
    </SearchContext.Provider>
  );
};
