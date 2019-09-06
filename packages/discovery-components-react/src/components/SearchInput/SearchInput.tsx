import React, { useContext } from 'react';
import { Search as CarbonSearchInput } from 'carbon-components-react';
import { SearchContext } from '../DiscoverySearch/DiscoverySearch';

interface SearchInputProps {
  small: boolean;
}

export const SearchInput: React.SFC<SearchInputProps> = ({ small }) => {
  const searchContext = useContext(SearchContext);
  const handleOnChange = (value: string) => {
    searchContext.onSearch(value);
  };

  return <CarbonSearchInput small={small} onChange={handleOnChange} />;
};
