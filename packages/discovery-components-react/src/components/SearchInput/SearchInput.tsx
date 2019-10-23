/**
 * @class SearchInput
 */

import * as React from 'react';
import { settings } from 'carbon-components';
import { Search as CarbonSearchInput, Button as CarbonButton } from 'carbon-components-react';
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
  /**
   * Number of autocomplete suggestions to show in the autocomplete dropdown (default: 5)
   */
  completionsCount?: number;
  /**
   * Prop to show/hide the autocomplete dropdown (default: true)
   */
  showAutocomplete?: boolean;
  /**
   * Minimum number of characters present in the last word before the SearchInput fetches autocomplete suggestions
   */
  minCharsToAutocomplete?: number;
  /*
   * True to return spelling suggestion with results
   */
  spellingSuggestions?: boolean;
  /**
   * Message prefix used when displaying spelling suggestion
   */
  spellingSuggestionsPrefix?: string;
}

export const SearchInput: React.SFC<SearchInputProps> = props => {
  const {
    small,
    placeHolderText,
    className,
    labelText = 'Search',
    light,
    closeButtonLabelText,
    id,
    splitSearchQuerySelector = ' ' as string,
    completionsCount = 5,
    showAutocomplete = true,
    minCharsToAutocomplete = 0,
    spellingSuggestions,
    spellingSuggestionsPrefix = 'Did you mean:'
  } = props;

  const inputId = id || `search-input__${uuid.v4()}`;
  const autocompletionClassName = `${settings.prefix}--search-autocompletion`;
  const spellingSuggestionClassName = `${settings.prefix}--spelling-suggestion`;
  const spellingSuggestionWrapperClassName = `${settings.prefix}--spelling-suggestion__wrapper`;
  const searchContext = React.useContext(SearchContext);
  const [value, setValue] = React.useState(
    searchContext.searchParameters.natural_language_query || ''
  );
  const lastWordOfValue = value.split(splitSearchQuerySelector).pop();
  const [skipFetchAutoCompletions, setSkipFetchAutoCompletions] = React.useState(false);
  const suggestedQuery = searchContext.searchResults.suggested_query;
  const [focused, setFocused] = React.useState(false);
  let focusTimeout: ReturnType<typeof setTimeout>;

  const handleOnChange = (evt: React.SyntheticEvent<EventTarget>): void => {
    const target = evt.currentTarget as HTMLInputElement;
    setValue(!!target ? target.value : '');
  };

  const selectAutocompletion = (i: number): void => {
    const valueArray = value.split(splitSearchQuerySelector);
    const prefix = valueArray.pop();
    const completionValue = !!searchContext.autocompletionResults.completions
      ? searchContext.autocompletionResults.completions[i]
      : prefix;
    valueArray.push(completionValue || '');
    setValue(`${valueArray.join(splitSearchQuerySelector)}${splitSearchQuerySelector}`);

    // The carbon Search component doesn't seem to use ForwardRef
    // so looking up by ID for now.
    const searchInput = document.getElementById(`${inputId}_input_field`);
    if (searchInput !== null) {
      searchInput.focus();
    }
  };

  const setupHandleAutocompletionKeyUp = (i: number) => {
    return (evt: React.KeyboardEvent<EventTarget>): void => {
      if (evt.key === 'Enter') {
        selectAutocompletion(i);
      }
    };
  };

  const setupHandleAutocompletionOnClick = (i: number) => {
    return (): void => {
      selectAutocompletion(i);
    };
  };

  const searchAndBlur = (): void => {
    searchContext.onSearch();

    // The carbon Search component doesn't seem to use ForwardRef
    // so looking up by ID for now.
    const searchInput = document.getElementById(`${inputId}_input_field`);
    if (searchInput !== null) {
      searchInput.blur();
    }
  };

  const setQueryOptions = (nlq: string): void => {
    searchContext.onUpdateQueryOptions({
      natural_language_query: nlq,
      filter: '',
      offset: 0
    });
  };

  const debouncedSearchTerm = useDebounce(value, 500);
  React.useEffect(() => {
    setQueryOptions(value);

    if (!skipFetchAutoCompletions) {
      searchContext.onFetchAutoCompletions(value);
    } else {
      setSkipFetchAutoCompletions(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  React.useEffect(() => {
    searchContext.onUpdateAutoCompletionOptions({
      updateAutocompletions: showAutocomplete,
      completionsCount: completionsCount,
      minCharsToAutocomplete: minCharsToAutocomplete,
      splitSearchQuerySelector: splitSearchQuerySelector
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAutocomplete, completionsCount, minCharsToAutocomplete, splitSearchQuerySelector]);

  React.useEffect(() => {
    searchContext.onUpdateQueryOptions({ spelling_suggestions: !!spellingSuggestions });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spellingSuggestions]);

  const handleOnKeyUp = (evt: React.KeyboardEvent<EventTarget>): void => {
    if (evt.key === 'Enter') {
      setQueryOptions(value);
      searchAndBlur();
    }
  };

  // onFocus for the carbon search component and the autocomplete dropdown
  const handleOnFocus = (): void => {
    // cancel the timeout set in handleOnBlur
    clearTimeout(focusTimeout);
    setFocused(true);
  };

  // onBlur for the entire SearchInput
  const handleOnBlur = (): void => {
    focusTimeout = setTimeout(() => {
      setFocused(false);
    }, 0);
  };

  const selectSuggestion = (evt: React.SyntheticEvent<EventTarget>): void => {
    evt.preventDefault();
    if (!!suggestedQuery) {
      setSkipFetchAutoCompletions(true);
      setValue(suggestedQuery);
      setQueryOptions(suggestedQuery);
      searchAndBlur();
    }
  };

  const shouldShowCompletions = lastWordOfValue !== '' && showAutocomplete && focused;
  const autocompletions = searchContext.autocompletionResults.completions || [];
  const autocompletionsList = autocompletions.map((autocompletion, i) => {
    const suffix = autocompletion.slice((lastWordOfValue as string).length);
    return (
      <ListBox key={`autocompletion_${i}`} className={`${autocompletionClassName}__wrapper`}>
        <ListBox.Field
          role="listitem"
          id={`autocompletion_${i}_field`}
          tabIndex="0"
          className={`${autocompletionClassName}__item`}
          onClick={setupHandleAutocompletionOnClick(i)}
          onKeyUp={setupHandleAutocompletionKeyUp(i)}
        >
          <div className={`${autocompletionClassName}__icon`}>
            <Search16 />
          </div>
          <div className={`${autocompletionClassName}__term`}>
            <strong>{value}</strong>
            {suffix}
          </div>
        </ListBox.Field>
      </ListBox>
    );
  });

  return (
    <div
      className={className}
      id={inputId}
      data-testid="search-input-test-id"
      onBlur={handleOnBlur}
    >
      <div onFocus={handleOnFocus}>
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
        {shouldShowCompletions && (
          <div className={autocompletionClassName} data-testid="completions-dropdown-test-id">
            {autocompletionsList}
          </div>
        )}
      </div>
      {!!suggestedQuery && (
        <div className={spellingSuggestionWrapperClassName}>
          {spellingSuggestionsPrefix}
          <CarbonButton
            className={spellingSuggestionClassName}
            onClick={selectSuggestion}
            kind="ghost"
            size="small"
          >
            {suggestedQuery}
          </CarbonButton>
        </div>
      )}
    </div>
  );
};

export default SearchInput;
