import * as React from 'react';
import DiscoveryV1 from 'ibm-watson/discovery/v1';

interface DiscoverySearchProps {
  searchClient: DiscoveryV1
}
interface SearchContextProps {
  searchClient: DiscoveryV1
}

export const SearchContext = React.createContext<SearchContextProps>({
  searchClient: new DiscoveryV1({
    url: 'foo',
    username: 'bar',
    password: 'baz',
    version: '2019-01-01'
  })
});

export const DiscoverySearch: React.SFC<DiscoverySearchProps> = (props) => {
  return (
    <SearchContext.Provider value={{ searchClient: props.searchClient }}>
      {props.children}
    </SearchContext.Provider>
  );
};