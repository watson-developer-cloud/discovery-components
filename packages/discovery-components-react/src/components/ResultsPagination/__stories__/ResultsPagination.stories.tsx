import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, array, text, boolean, number } from '@storybook/addon-knobs/react';
import { ResultsPagination } from '../ResultsPagination';
import { DiscoverySearch, DiscoverySearchProps } from '../../DiscoverySearch/DiscoverySearch';
import { StoryWrapper, DummySearchClient } from '../../../utils/storybookUtils';
import overrideSearchResults from '../__fixtures__/searchResults';
import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';
import { action } from '@storybook/addon-actions';
import { createDummyResponsePromise } from '../../../utils/testingUtils';

export const props = () => ({
  page: 1,
  pageSize: number('Initial page size', 10),
  pageSizes: array('Page size choices', [10, 20, 30, 40, 50]),
  showPageSizeSelector: boolean('Show selector for number of result items to show per page', true)
});

class DummySearchClientWithQuery extends DummySearchClient {
  query(params: DiscoveryV2.QueryParams): Promise<DiscoveryV2.Response<DiscoveryV2.QueryResponse>> {
    action('query')(params);
    return createDummyResponsePromise(overrideSearchResults);
  }
}

const discoverySearchProps = (): DiscoverySearchProps => ({
  searchClient: new DummySearchClientWithQuery(),
  projectId: text('Project ID', 'project-id'),
  overrideSearchResults
});

storiesOf('ResultsPagination', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    return (
      <StoryWrapper>
        <DiscoverySearch {...discoverySearchProps()}>
          <ResultsPagination {...props()} />
        </DiscoverySearch>
      </StoryWrapper>
    );
  });
