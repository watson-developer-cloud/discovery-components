import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, boolean } from '@storybook/addon-knobs/react';
import SearchInput from './SearchInput';
import { DiscoverySearch, DiscoverySearchProps } from '../DiscoverySearch/DiscoverySearch';
import { StoryWrapper } from '../../utils/storybookUtils';

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
  spellingSuggestion: boolean('Fetch spelling suggestions', true)
});
const autocompletions = {
  completions: ['eagle', 'eager', 'eagles', 'eagerly', 'eag']
};
class DummyClient {
  query() {
    return Promise.resolve({});
  }
  getAutocompletion() {
    return Promise.resolve(autocompletions);
  }
  listCollections() {
    return Promise.resolve();
  }
}

const discoverySearchProps = (): DiscoverySearchProps => ({
  searchClient: new DummyClient(),
  projectId: text('Project ID', 'project-id')
});

storiesOf('SearchInput', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    return (
      <StoryWrapper>
        <DiscoverySearch {...discoverySearchProps()}>
          <SearchInput {...props()} />
        </DiscoverySearch>
      </StoryWrapper>
    );
  })
  .add('with autocomplete', () => {
    const autocompleteProps = Object.assign(discoverySearchProps(), {
      autocompletionResults: autocompletions,
      queryParameters: {
        natural_language_query: 'eag'
      }
    });

    return (
      <StoryWrapper>
        <DiscoverySearch {...autocompleteProps}>
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
