import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text } from '@storybook/addon-knobs/react';
import { StoryWrapper, DummySearchClient } from '../../../utils/storybookUtils';
import { DiscoverySearch, DiscoverySearchProps } from '../../DiscoverySearch/DiscoverySearch';
import { SearchResults } from '../SearchResults';
import overrideSearchResults from '../__fixtures__/searchResults';

const props = () => ({
  bodyField: text('Field to display as body', 'highlight.text[0]')
});

const discoverySearchProps = (): DiscoverySearchProps => ({
  searchClient: new DummySearchClient(),
  projectId: text('Project ID', 'project-id'),
  overrideSearchResults
});

storiesOf('SearchResults', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    return (
      <StoryWrapper>
        <DiscoverySearch {...discoverySearchProps()}>
          <SearchResults {...props()} />
        </DiscoverySearch>
      </StoryWrapper>
    );
  });
