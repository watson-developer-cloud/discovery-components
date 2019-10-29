import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, object, boolean } from '@storybook/addon-knobs/react';
import { SearchRefinements } from './SearchRefinements';
import { refinementsQueryResponse } from './fixtures/refinementsQueryResponse';
import collectionsResponse from './fixtures/collectionsResponse';
import { StoryWrapper, DummySearchClient } from '../../utils/storybookUtils';
import { createDummyResponsePromise } from '../../utils/testingUtils';
import { DiscoverySearch, DiscoverySearchProps } from '../DiscoverySearch/DiscoverySearch';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import { action } from '@storybook/addon-actions';

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

class DummySearchClientWithQueryAndCollections extends DummySearchClient {
  query(params: DiscoveryV1.QueryParams): Promise<DiscoveryV1.Response<DiscoveryV1.QueryResponse>> {
    action('query')(params);
    return createDummyResponsePromise(refinementsQueryResponse.result);
  }
  listCollections(
    params: DiscoveryV1.ListCollectionsParams
  ): Promise<DiscoveryV1.Response<DiscoveryV1.ListCollectionsResponse>> {
    action('listCollections')(params);
    return createDummyResponsePromise(collectionsResponse.result);
  }
}

const discoverySearchProps = (
  queryParams?: Partial<DiscoveryV1.QueryParams>
): DiscoverySearchProps => ({
  searchClient: new DummySearchClientWithQueryAndCollections(),
  projectId: text('Project ID', 'project-id'),
  overrideQueryParameters: queryParams
});

storiesOf('SearchRefinements', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    const exampleProps = props();
    return (
      <StoryWrapper>
        <DiscoverySearch {...discoverySearchProps({ filter: 'subject:"this | that"|"bl:ah"' })}>
          <SearchRefinements {...exampleProps} />
        </DiscoverySearch>
      </StoryWrapper>
    );
  })
  .add('initially selected collection', () => {
    const exampleProps = props();
    return (
      <StoryWrapper>
        <DiscoverySearch {...discoverySearchProps({ collectionIds: ['deadspin9876'] })}>
          <SearchRefinements {...exampleProps} showCollections={true} />
        </DiscoverySearch>
      </StoryWrapper>
    );
  });
