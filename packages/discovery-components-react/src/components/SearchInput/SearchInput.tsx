/**
 * @class SearchInput
 */

import * as React from 'react';
import { settings } from 'carbon-components';
import { Search as CarbonSearchInput } from 'carbon-components-react';
import ListBox from 'carbon-components-react/lib/components/ListBox';
import { SearchContext } from '../DiscoverySearch/DiscoverySearch';
import useDebounce from '../../utils/useDebounce';
import uuid from 'uuid';
import Search16 from '@carbon/icons-react/lib/search/16.js';

interface SearchInputProps {
  /**
   * True to use small variant of Search
   */
  small?: boolean;
  /**
   * Placeholder text for the SearchInput
   */
  placeHolderText?: string;
  /**
   * className to style SearchInput
   */
  className?: string;
  /**
   * Label text for the SearchInput
   */
  labelText?: React.ReactNode;
  /**
   * True to use the light theme
   */
  light?: boolean;
  /**
   * Label text for the close button
   */
  closeButtonLabelText?: string;
  /**
   * ID for the SearchInput
   */
  id?: string;
  /**
   * Value to split words in the search query (Default: ' ')
   */
  splitSearchQuerySelector?: string;
}

export const SearchInput: React.SFC<SearchInputProps> = props => {
  const {
    small,
    placeHolderText,
    className,
    labelText,
    light,
    closeButtonLabelText,
    id,
    splitSearchQuerySelector
  } = props;

  const inputId = id || `search-input__${uuid.v4()}`;
  const autocompleteClassName = `${settings.prefix}--search-autocomplete`;
  const searchContext = React.useContext(SearchContext);
  const [value, setValue] = React.useState(
    searchContext.searchParameters.natural_language_query || ''
  );
  const handleOnChange = (evt: React.SyntheticEvent<EventTarget>): void => {
    const target = evt.currentTarget as HTMLInputElement;
    setValue(!!target ? target.value : '');
  };

  const setupHandleOnCompletionFocus = (i: number) => {
    return (): void => {
      const valueArray = value.split(splitSearchQuerySelector as string);
      const prefix = valueArray.pop();
      const completionValue = !!searchContext.completionResults.completions
        ? searchContext.completionResults.completions[i]
        : prefix;
      valueArray.push(completionValue || '');
      setValue(valueArray.join(splitSearchQuerySelector));
    };
  };

  const debouncedSearchTerm = useDebounce(value, 500);
  React.useEffect(() => {
    searchContext.onUpdateNaturalLanguageQuery(value, splitSearchQuerySelector as string);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, splitSearchQuerySelector]);

  const handleOnKeyUp = (evt: React.KeyboardEvent<EventTarget>): void => {
    if (evt.key === 'Enter') {
      searchContext.onUpdateNaturalLanguageQuery(value);
      searchContext.onSearch();
    }
  };

  const selectCompletion = (): void => {
    const currentQuery = `${value} `;
    setValue(currentQuery);

    // The carbon Search component does seem to use ForwardRef
    // so looking up by ID for now.
    const searchInput = document.getElementById(`${inputId}_input_field`);
    if (searchInput !== null) {
      searchInput.focus();
    }
  };

  const handleCompletionKeyEvent = (evt: React.KeyboardEvent<EventTarget>): void => {
    if (evt.key === 'Enter') {
      selectCompletion();
    }
  };

  const completions = searchContext.completionResults.completions || [];
  const completionsList = completions.map((completion, i) => {
    return (
      <ListBox key={`completion_${i}`} className={`${autocompleteClassName}__wrapper`}>
        <ListBox.Field
          role="listitem"
          id={`completion_${i}_field`}
          tabIndex="0"
          className={`${autocompleteClassName}__item`}
          onFocus={setupHandleOnCompletionFocus(i)}
          onClick={selectCompletion}
          onKeyDown={handleCompletionKeyEvent}
        >
          <div className={`${autocompleteClassName}__icon`}>
            <Search16 />
          </div>
          <div className={`${autocompleteClassName}__term`}>{completion}</div>
        </ListBox.Field>
      </ListBox>
    );
  });

  return (
    <div className={className} id={inputId}>
      <CarbonSearchInput
        small={small}
        placeHolderText={placeHolderText}
        onKeyUp={handleOnKeyUp}
        onChange={handleOnChange}
        labelText={labelText}
        light={light}
        closeButtonLabelText={closeButtonLabelText}
        value={value}
        id={`${inputId}_input_field`}
      />
      {!!value && <div className={autocompleteClassName}>{completionsList}</div>}
    </div>
  );
};

SearchInput.defaultProps = {
  labelText: 'Search input label text', // the only required prop for Carbon Search component that doesn't have a default value
  splitSearchQuerySelector: ' '
};

export default SearchInput;
