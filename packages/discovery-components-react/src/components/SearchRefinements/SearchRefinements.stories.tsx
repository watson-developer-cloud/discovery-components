import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, object, boolean } from '@storybook/addon-knobs/react';
import { SearchRefinements } from './SearchRefinements';
import { refinementsQueryResponse } from './fixtures/refinementsQueryResponse';
import collectionsResponse from './fixtures/collectionsResponse';
import { DiscoverySearch, DiscoverySearchProps } from '../DiscoverySearch/DiscoverySearch';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';

export const props = () => ({
  showCollections: boolean('Show collection refinements', false),
  configuration: object('Refinements configuration', [
    {
      field: 'author',
      count: 3
    },
    {
      field: 'subject',
      count: 4
    }
  ])
});

class DummyClient {
  query() {
    return Promise.resolve(refinementsQueryResponse);
  }
  getAutocompletion() {
    return Promise.resolve();
  }
  listCollections() {
    return Promise.resolve(collectionsResponse);
  }
}

const discoverySearchProps = (
  queryParams?: Partial<DiscoveryV1.QueryParams>
): DiscoverySearchProps => ({
  searchClient: new DummyClient(),
  projectId: text('Project ID', 'project-id'),
  overrideQueryParameters: queryParams
});

storiesOf('SearchRefinements', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    const exampleProps = props();
    return (
      <div style={{ padding: '1rem', backgroundColor: '#f3f3f3' }}>
        <DiscoverySearch {...discoverySearchProps({ filter: 'subject:"this | that"|"bl:ah"' })}>
          <SearchRefinements {...exampleProps} />
        </DiscoverySearch>
      </div>
    );
  })
  .add('initially selected collection', () => {
    const exampleProps = props();
    return (
      <div style={{ padding: '1rem', backgroundColor: '#f3f3f3' }}>
        <DiscoverySearch {...discoverySearchProps({ collection_ids: ['deadspin9876'] })}>
          <SearchRefinements {...exampleProps} showCollections={true} />
        </DiscoverySearch>
      </div>
    );
  });
