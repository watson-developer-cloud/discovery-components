import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, boolean } from '@storybook/addon-knobs/react';
import { StoryWrapper, DummySearchClient } from '../../../utils/storybookUtils';
import { DiscoverySearch, DiscoverySearchProps } from '../../DiscoverySearch/DiscoverySearch';
import { SearchResults } from '../SearchResults';
import overrideSearchResults from '../__fixtures__/searchResults';

const props = () => ({
  bodyField: text('Field to display as body', 'text'),
  collectionLabel: text('Collection name label for search result', 'Collection Name:'),
  displayedTextInDocumentButtonText: text(
    'CTA text for viewing the passage or bodyField in the document',
    'View passage in document'
  ),
  tableInDocumentButtonText: text(
    'CTA text for viewing the table result in the document',
    'View table in document'
  ),
  showTablesOnlyToggle: boolean('Display a toggle for showing table results only', false),
  tablesOnlyToggleLabelText: text(
    'Label text for the toggle for showing table results only',
    'Show table results only'
  )
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
