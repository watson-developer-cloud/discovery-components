import React from 'react';
import { storiesOf } from '@storybook/react';
import { text, boolean, number, object } from '@storybook/addon-knobs';
import SearchInput from '../SearchInput';
import SearchResults from 'components/SearchResults/SearchResults';
import DiscoverySearch, { DiscoverySearchProps } from 'components/DiscoverySearch/DiscoverySearch';
import { StoryWrapper, DummySearchClient } from 'utils/storybookUtils';
import { createDummyResponsePromise } from 'utils/testingUtils';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { action } from '@storybook/addon-actions';
import { defaultMessages } from '../messages';

const props = () => ({
  className: text('Classname to pass in your own styling (className)', ''),
  id: text('Html element ID (id)', ''),
  splitSearchQuerySelector: text(
    'String to split words on for autocompletion (splitSearchQuerySelector)',
    ' '
  ),
  spellingSuggestion: boolean('Fetch spelling suggestions (spellingSuggestion)', true),
  completionsCount: number('Number of autocompletion results to show (completionsCount)', 5),
  showAutocomplete: boolean('Show dropdown of autocomplete suggestions (showAutocomplete)', true),
  minCharsToAutocomplete: number(
    'Minimum characters in last word before showing autocomplete suggestions (minCharsToAutocomplete)',
    1
  ),
  messages: object("Default messages for the component's text strings", defaultMessages),
  autocompleteDelay: number(
    'Milliseconds to delay the autocomplete API requests (autocompleteDelay)',
    200
  )
});

let autocompletions: string[] = [];

const generateCompletionsArray = (length: number, prefix: string): string[] => {
  const completionsArray = [];
  for (let i = 0; i < length; i++) {
    const defaultText = `autocomplete-suggestion-${i + 1}`;
    const completionText = prefix + defaultText.slice(prefix.length);
    completionsArray.push(completionText);
  }
  return completionsArray;
};

class DummySearchClientWithAutocomplete extends DummySearchClient {
  getAutocompletion(
    params: DiscoveryV2.GetAutocompletionParams
  ): Promise<DiscoveryV2.Response<DiscoveryV2.Completions>> {
    action('getAutocompletion')(params);
    autocompletions = generateCompletionsArray(props().completionsCount || 0, params.prefix || '');
    return createDummyResponsePromise({ completions: autocompletions });
  }
}

const discoverySearchProps = (): DiscoverySearchProps => ({
  searchClient: new DummySearchClientWithAutocomplete(),
  projectId: text('Project ID', 'project-id'),
  overrideAutocompletionResults: {
    completions: autocompletions
  }
});

storiesOf('SearchInput', module)
  .addParameters({ component: SearchInput })
  .add('default', () => {
    autocompletions = generateCompletionsArray(props().completionsCount, '');
    return (
      <StoryWrapper>
        <DiscoverySearch {...discoverySearchProps()}>
          <SearchInput {...props()} />
        </DiscoverySearch>
      </StoryWrapper>
    );
  })
  .add('with spelling suggestions', () => {
    const spellingSuggestionProps = {
      ...discoverySearchProps(),
      overrideQueryParameters: {
        naturalLanguageQuery: 'Waston'
      },
      overrideSearchResults: {
        suggested_query: 'Watson'
      }
    };

    return (
      <StoryWrapper>
        <DiscoverySearch {...spellingSuggestionProps}>
          <SearchInput {...props()} />
          <SearchResults />
        </DiscoverySearch>
      </StoryWrapper>
    );
  });
