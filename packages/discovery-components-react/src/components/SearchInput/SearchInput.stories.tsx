import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, boolean, number } from '@storybook/addon-knobs/react';
import SearchInput from './SearchInput';
import { DiscoverySearch, DiscoverySearchProps } from '../DiscoverySearch/DiscoverySearch';
import { StoryWrapper } from '../../utils/storybookUtils';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';

const props = () => ({
  className: text('ClassName', ''),
  small: boolean('Small', false),
  light: boolean('Light', true),
  placeHolderText: text('Placeholder', 'Placeholder text'),
  labelText: text('Label', 'Label text'),
  closeButtonLabelText: text('Close button label', 'Close button label text'),
  id: text('ID', ''),
  splitSearchQuerySelector: text(
    "String to split words on for autocompletion (defaults to ' ')",
    ' '
  ),
  spellingSuggestion: boolean('Fetch spelling suggestions', true),
  completionsCount: number('Number of autocompletion results to show', 5),
  showAutocomplete: boolean('Show autocompletions', true),
  minCharsToAutocomplete: number(
    'Minimum characters in last word before showing autocomplete suggestions',
    1
  )
});

let currentValue = ''; // used for autocomplete suggestions
let autocompletions: string[] = [];

const generateCompletionsArray = (length: number) => {
  const completionsArray = [];
  for (let i = 0; i < length; i++) {
    const defaultText = `autocomplete-suggestion-${i + 1}`;
    completionsArray.push(currentValue + defaultText.slice(currentValue.length));
  }
  return completionsArray;
};

class DummyClient {
  query() {
    return Promise.resolve({});
  }
  getAutocompletion(params: DiscoveryV1.GetAutocompletionParams) {
    currentValue = params.prefix || '';
    autocompletions = generateCompletionsArray(params.count || 0);
    return Promise.resolve({ completions: autocompletions });
  }
  listCollections() {
    return Promise.resolve();
  }
}

const discoverySearchProps = (): DiscoverySearchProps => ({
  searchClient: new DummyClient(),
  projectId: text('Project ID', 'project-id'),
  autocompletionResults: {
    completions: autocompletions
  }
});

storiesOf('SearchInput', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    autocompletions = generateCompletionsArray(props().completionsCount);
    return (
      <StoryWrapper>
        <DiscoverySearch {...discoverySearchProps()}>
          <SearchInput {...props()} />
        </DiscoverySearch>
      </StoryWrapper>
    );
  })
  .add('with spelling suggestion', () => {
    const spellingSuggestionProps = Object.assign(discoverySearchProps(), {
      queryParameters: {
        natural_language_query: 'Philadlphia'
      },
      searchResults: {
        suggested_query: 'Philadelphia'
      }
    });

    return (
      <StoryWrapper>
        <DiscoverySearch {...spellingSuggestionProps}>
          <SearchInput {...props()} />
        </DiscoverySearch>
      </StoryWrapper>
    );
  });
