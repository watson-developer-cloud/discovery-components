import get from 'lodash/get';

/**
 * @class SearchInput
 */

import React, { FC, useContext, useEffect, useState, SyntheticEvent, KeyboardEvent } from 'react';
import { settings } from 'carbon-components';
import { Search as CarbonSearchInput } from 'carbon-components-react';
import ListBox from 'carbon-components-react/lib/components/ListBox';
import { SearchApi, SearchContext } from '../DiscoverySearch/DiscoverySearch';
import useDebounce from '../../utils/useDebounce';
import uuid from 'uuid';
import Search16 from '@carbon/icons-react/lib/search/16';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { useDeepCompareCallback } from '../../utils/useDeepCompareMemoize';

interface SearchInputProps {
  /**
   * className to style SearchInput
   */
  className?: string;
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
  /**
   * True to return spelling suggestion with results
   */
  spellingSuggestions?: boolean;
  /**
   * number of milliseconds to wait before executing an API request to get autocompletions
   */
  autocompleteDelay?: number;
  /**
   * Props to be passed into Carbon's Search component
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const SearchInput: FC<SearchInputProps> = props => {
  const {
    className,
    id,
    splitSearchQuerySelector = ' ' as string,
    completionsCount = 5,
    showAutocomplete,
    minCharsToAutocomplete = 0,
    spellingSuggestions,
    autocompleteDelay = 200,
    ...inputProps
  } = props;

  const inputId = id || `search-input__${uuid.v4()}`;
  const autocompletionClassName = `${settings.prefix}--search-autocompletion`;
  const searchInputClassNames = [className, `${settings.prefix}--search-input--discovery`];
  const {
    searchResponseStore: { parameters: searchParameters },
    autocompletionStore: { data: autocompletionResults },
    componentSettings
  } = useContext(SearchContext);
  const displaySettings = {
    showAutocomplete:
      showAutocomplete === undefined
        ? get(componentSettings, 'autocomplete', true)
        : showAutocomplete
  };

  const {
    performSearch,
    fetchAutocompletions,
    setAutocompletionOptions,
    setSearchParameters
  } = useContext(SearchApi);
  const [value, setValue] = useState(searchParameters.naturalLanguageQuery || '');
  const completions = (autocompletionResults && autocompletionResults.completions) || [];
  const lastWordOfValue = value.split(splitSearchQuerySelector).pop();
  const [skipFetchAutoCompletions, setSkipFetchAutoCompletions] = useState(false);
  const [focused, setFocused] = useState(false);
  let focusTimeout: ReturnType<typeof setTimeout>;

  useEffect(() => {
    setValue(searchParameters.naturalLanguageQuery || '');
  }, [searchParameters.naturalLanguageQuery]);

  const handleOnChange = (evt: SyntheticEvent<EventTarget>): void => {
    const target = evt.currentTarget as HTMLInputElement;
    setValue(!!target ? target.value : '');
  };

  const selectAutocompletion = (i: number): void => {
    const valueArray = value.split(splitSearchQuerySelector);
    const prefix = valueArray.pop();
    const completionValue = !!completions ? completions[i] : prefix;
    valueArray.push(completionValue || '');
    setValue(`${valueArray.join(splitSearchQuerySelector)}${splitSearchQuerySelector}`);

    // The carbon Search component doesn't seem to use ForwardRef
    // so looking up by ID for now.
    const searchInput = document.getElementById(`${inputId}_input_field`);
    if (searchInput !== null) {
      searchInput.focus();
    }
  };

  const prepareFreshSearchParameters = useDeepCompareCallback(
    (nlq: string): DiscoveryV2.QueryParams => {
      return {
        ...searchParameters,
        naturalLanguageQuery: nlq,
        offset: 0,
        filter: ''
      };
    },
    [searchParameters]
  );

  const setupHandleAutocompletionKeyUp = (i: number) => {
    return (evt: KeyboardEvent<EventTarget>): void => {
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

  const searchAndBlur = (value: string): void => {
    performSearch(prepareFreshSearchParameters(value));

    // The carbon Search component doesn't seem to use ForwardRef
    // so looking up by ID for now.
    const searchInput = document.getElementById(`${inputId}_input_field`);
    if (searchInput !== null) {
      searchInput.blur();
    }
  };

  const debouncedSearchTerm = useDebounce(value, autocompleteDelay);
  useEffect(() => {
    setSearchParameters((currentSearchParameters: DiscoveryV2.QueryParams) => {
      return {
        ...currentSearchParameters,
        naturalLanguageQuery: debouncedSearchTerm
      };
    });

    if (!skipFetchAutoCompletions) {
      fetchAutocompletions(debouncedSearchTerm);
    } else {
      setSkipFetchAutoCompletions(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, fetchAutocompletions, setSearchParameters]);

  useEffect(() => {
    setAutocompletionOptions({
      updateAutocompletions: displaySettings.showAutocomplete,
      completionsCount: completionsCount,
      minCharsToAutocomplete: minCharsToAutocomplete,
      splitSearchQuerySelector: splitSearchQuerySelector
    });
  }, [
    displaySettings.showAutocomplete,
    completionsCount,
    minCharsToAutocomplete,
    splitSearchQuerySelector,
    setAutocompletionOptions
  ]);

  useEffect(() => {
    setSearchParameters((currentSearchParameters: DiscoveryV2.QueryParams) => {
      return { ...currentSearchParameters, spellingSuggestions: !!spellingSuggestions };
    });
  }, [setSearchParameters, spellingSuggestions]);

  const handleOnKeyUp = (evt: KeyboardEvent<EventTarget>): void => {
    if (evt.key === 'Enter') {
      searchAndBlur(value);
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

  const shouldShowCompletions =
    lastWordOfValue !== '' && displaySettings.showAutocomplete && focused;
  const autocompletionsList = completions.map((completion, i) => {
    const valueWithoutLastWord = value.slice(0, value.length - (lastWordOfValue as string).length);
    if (completion.startsWith(lastWordOfValue as string)) {
      const suffix = completion.slice((lastWordOfValue as string).length);
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
              {valueWithoutLastWord}
              <strong>{lastWordOfValue}</strong>
              {suffix}
            </div>
          </ListBox.Field>
        </ListBox>
      );
    }
    return null;
  });

  return (
    <div
      className={searchInputClassNames.join(' ')}
      id={inputId}
      data-testid="search-input-test-id"
      onBlur={handleOnBlur}
    >
      <div onFocus={handleOnFocus}>
        <CarbonSearchInput
          onKeyUp={handleOnKeyUp}
          onChange={handleOnChange}
          value={value}
          id={`${inputId}_input_field`}
          labelText={inputProps.labelText || 'Search'} //required prop, but it doesn't get rendered
          {...inputProps}
        />
        {shouldShowCompletions && (
          <div className={autocompletionClassName} data-testid="completions-dropdown-test-id">
            {autocompletionsList}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchInput;
