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
  /**
   * Hides the magnifying glass icon in the search bar
   */
  hideSearchIcon: boolean;
  /**
   * Hides the clear search text icon in the search bar
   */
  hideClearIcon: boolean;
}

export const SearchInput: React.SFC<SearchInputProps> = props => {
  // static defaultProps = {
  //   className: '',
  //   placeholder: '',
  //   hideSearchIcon: false,
  //   hideClearIcon: false
  // };
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

  //TODO: modify className to apply custom styling + whatever styling we want to set by default
  //TODO: logic for hideSearchIcon and hideClearIcon

  return (
    <CarbonSearchInput
      type={type}
      small={small}
      placeHolderText={placeHolderText}
      onKeyUp={handleOnKeyUp}
      onChange={handleOnChange}
      className={className}
      labelText={labelText}
      light={light}
      closeButtonLabelText={closeButtonLabelText}
      defaultValue={defaultValue}
      value={value}
    />
  );
};

export default SearchInput;
