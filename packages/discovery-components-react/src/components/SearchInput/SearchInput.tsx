import React, { useContext } from 'react';
import { Search as CarbonSearchInput } from 'carbon-components-react';
import { SearchContext } from '../DiscoverySearch/DiscoverySearch';

interface SearchInputProps {
  small: boolean;
}

export const SearchInput: React.SFC<SearchInputProps> = ({ small }) => {
  const searchContext = useContext(SearchContext);
  const handleOnChange = (evt: any): void => {
    searchContext.onUpdateNaturalLanguageQuery(evt.currentTarget.value);
    searchContext.onSearch();
  };

  return <CarbonSearchInput small={small} onChange={handleOnChange} />;
};
