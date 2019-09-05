import React, { useContext } from 'react';
import DiscoveryV1 from 'ibm-watson/discovery/v1';
import { Search as CarbonSearchInput } from 'carbon-components-react';
import { SearchContext } from '../DiscoverySearch/DiscoverySearch';

interface SearchInputProps {
  small: boolean;
}

export const SearchInput: React.SFC<SearchInputProps> = ({ small }) => {
  const searchContext = useContext(SearchContext);
  const callback = (response: DiscoveryV1.QueryResponse) => window.alert(response);
  const handleOnChange = (value: string) => {
    return searchContext.searchClient.query({
      environment_id: 'default',
      collection_id: 'foo',
      natural_language_query: value
    }, callback);
  };

  return <CarbonSearchInput small={small} onChange={handleOnChange} />;
}