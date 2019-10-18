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
    labelText,
    light,
    closeButtonLabelText,
    id,
    splitSearchQuerySelector,
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
  const [skipFetchAutoCompletions, setSkipFetchAutoCompletions] = React.useState(false);
  const suggestedQuery = searchContext.searchResults.suggested_query;
  const handleOnChange = (evt: React.SyntheticEvent<EventTarget>): void => {
    const target = evt.currentTarget as HTMLInputElement;
    setValue(!!target ? target.value : '');
  };

  const setupHandleOnCompletionFocus = (i: number) => {
    return (): void => {
      const valueArray = value.split(splitSearchQuerySelector as string);
      const prefix = valueArray.pop();
      const autocompletionValue = !!searchContext.autocompletionResults.completions
        ? searchContext.autocompletionResults.completions[i]
        : prefix;
      valueArray.push(autocompletionValue || '');
      setValue(valueArray.join(splitSearchQuerySelector));
    };
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
      splitSearchQuerySelector: splitSearchQuerySelector
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splitSearchQuerySelector]);

  React.useEffect(() => {
    searchContext.onUpdateQueryOptions({ spelling_suggestions: !!spellingSuggestions });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spellingSuggestions]);

  const handleOnKeyUp = (evt: React.KeyboardEvent<EventTarget>): void => {
    if (evt.key === 'Enter') {
      setQueryOptions(value);
      searchContext.onSearch();
    }
  };

  const selectAutoCompletion = (): void => {
    const currentQuery = `${value} `;
    setValue(currentQuery);

    // The carbon Search component does seem to use ForwardRef
    // so looking up by ID for now.
    const searchInput = document.getElementById(`${inputId}_input_field`);
    if (searchInput !== null) {
      searchInput.focus();
    }
  };

  const selectSuggestion = (evt: React.SyntheticEvent<EventTarget>): void => {
    evt.preventDefault();
    if (!!suggestedQuery) {
      setSkipFetchAutoCompletions(true);
      setValue(suggestedQuery);
      setQueryOptions(suggestedQuery);
      searchContext.onSearch();
    }
  };

  const handleAutoCompletionKeyEvent = (evt: React.KeyboardEvent<EventTarget>): void => {
    if (evt.key === 'Enter') {
      selectAutoCompletion();
    }
  };

  const autocompletions = searchContext.autocompletionResults.completions || [];
  const autocompletionsList = autocompletions.map((autocompletion, i) => {
    return (
      <ListBox key={`autocompletion_${i}`} className={`${autocompletionClassName}__wrapper`}>
        <ListBox.Field
          role="listitem"
          id={`autocompletion_${i}_field`}
          tabIndex="0"
          className={`${autocompletionClassName}__item`}
          onFocus={setupHandleOnCompletionFocus(i)}
          onClick={selectAutoCompletion}
          onKeyDown={handleAutoCompletionKeyEvent}
        >
          <div className={`${autocompletionClassName}__icon`}>
            <Search16 />
          </div>
          <div className={`${autocompletionClassName}__term`}>{autocompletion}</div>
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
      {!!value && <div className={autocompletionClassName}>{autocompletionsList}</div>}
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

SearchInput.defaultProps = {
  labelText: 'Search input label text', // the only required prop for Carbon Search component that doesn't have a default value
  splitSearchQuerySelector: ' '
};

export default SearchInput;
