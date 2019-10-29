import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, boolean, number } from '@storybook/addon-knobs/react';
import SearchInput from './SearchInput';
import { DiscoverySearch, DiscoverySearchProps } from '../DiscoverySearch/DiscoverySearch';
import { StoryWrapper, DummySearchClient } from '../../utils/storybookUtils';
import { createDummyResponsePromise } from '../../utils/testingUtils';
import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';
import { action } from '@storybook/addon-actions';

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

class DummySearchClientWithAutocomplete extends DummySearchClient {
  getAutocompletion(
    params: DiscoveryV2.GetAutocompletionParams
  ): Promise<DiscoveryV2.Response<DiscoveryV2.Completions>> {
    action('getAutocompletion')(params);
    currentValue = params.prefix || '';
    autocompletions = generateCompletionsArray(props().completionsCount || 0);
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
    const spellingSuggestionProps = {
      ...discoverySearchProps(),
      overrideQueryParameters: {
        naturalLanguageQuery: 'Philadlphia'
      },
      overrideSearchResults: {
        suggested_query: 'Philadelphia'
      }
    };

    return (
      <StoryWrapper>
        <DiscoverySearch {...spellingSuggestionProps}>
          <SearchInput {...props()} />
        </DiscoverySearch>
      </StoryWrapper>
    );
  });
