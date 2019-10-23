import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text } from '@storybook/addon-knobs/react';

import { DiscoverySearch, DiscoverySearchProps } from '../../DiscoverySearch/DiscoverySearch';
import { SearchResults } from '../SearchResults';
import overrideSearchResults from '../__fixtures__/searchResults';

const props = () => ({
  bodyField: text('Field to display as body', 'highlight.text[0]')
});

class DummyClient {
  query() {
    return Promise.resolve();
  }
  getAutocompletion() {
    return Promise.resolve();
  }
  listCollections() {
    return Promise.resolve();
  }
}

const discoverySearchProps = (): DiscoverySearchProps => ({
  searchClient: new DummyClient(),
  projectId: text('Project ID', 'project-id'),
  overrideSearchResults
});

storiesOf('SearchResults', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    return (
      <div style={{ padding: '1rem', backgroundColor: '#f3f3f3' }}>
        <DiscoverySearch {...discoverySearchProps()}>
          <SearchResults {...props()} />
        </DiscoverySearch>
      </div>
    );
  });
