/**
 * @class ExampleComponent
 */

import React, { useContext, useState, useEffect } from 'react';
import { Search as CarbonSearchInput } from 'carbon-components-react';
import { SearchContext } from '../DiscoverySearch/DiscoverySearch';
import useDebounce from '../../utils/useDebounce';

interface SearchInputProps {
  /**
   * The type of input (optional)
   */
  type: string;
  /**
   * True to use small variant of Search
   */
  small: boolean;
  /**
   * Placeholder text for the SearchInput
   */
  placeHolderText: string;
  /**
   * className to style SearchInput
   */
  className: string;
  /**
   * Label text for the SearchInput
   */
  labelText: React.ReactNode;
  /**
   * True to use the light theme
   */
  light: boolean;
  /**
   * Label text for the close button
   */
  closeButtonLabelText: string;
  /**
   * Set the default value of the query in SearchInput
   */
  defaultValue: string | number;
}

export const SearchInput: React.SFC<SearchInputProps> = props => {
  const {
    type,
    small,
    placeHolderText,
    className,
    labelText,
    light,
    closeButtonLabelText,
    defaultValue
  } = props;

  const searchContext = useContext(SearchContext);
  const [value, setValue] = useState(searchContext.searchParameters.natural_language_query || '');
  const handleOnChange = (evt: React.SyntheticEvent<EventTarget>): void => {
    const target = evt.currentTarget as HTMLInputElement;
    setValue(target.value);
  };
  const debouncedSearchTerm = useDebounce(value, 500);
  useEffect(() => {
    searchContext.onUpdateNaturalLanguageQuery(value);
  }, [debouncedSearchTerm]);
  const handleOnKeyUp = (evt: React.KeyboardEvent<EventTarget>): void => {
    if (evt.key === 'Enter') {
      searchContext.onUpdateNaturalLanguageQuery(value);
      searchContext.onSearch();
    }
  };

  return (
    <div className={className}>
      <CarbonSearchInput
        type={type}
        small={small}
        placeHolderText={placeHolderText}
        onKeyUp={handleOnKeyUp}
        onChange={handleOnChange}
        labelText={labelText}
        light={light}
        closeButtonLabelText={closeButtonLabelText}
        defaultValue={defaultValue}
        value={value}
        id={'carbon-search-input'}
      />
    </div>
  );
};

SearchInput.defaultProps = {
  labelText: 'Search input label text' // the only required prop for Carbon Search component that doesn't have a default value
};

export default SearchInput;
