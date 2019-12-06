import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, array, text, boolean, number } from '@storybook/addon-knobs/react';
import { DiscoverySearch, DiscoverySearchProps } from '@DiscoverySearch/DiscoverySearch';
import { DummySearchClient } from '@rootUtils/storybookUtils';
import overrideSearchResults from '../__fixtures__/searchResults';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { action } from '@storybook/addon-actions';
import { createDummyResponsePromise } from '@rootUtils/testingUtils';
import { ResultsPagination } from '../ResultsPagination';
import defaultReadme from './default.md';
import marked from 'marked';

export const props = () => ({
  page: number('The current page (page)', 1),
  pageSize: number('Number of items per page (pageSize)', 10),
  pageSizes: array('Page size choices (pageSizes)', [10, 20, 30, 40, 50]),
  showPageSizeSelector: boolean(
    'Show selector for dynamically changing `pageSize` (showPageSizeSelector)',
    true
  )
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
  .add(
    'default',
    () => {
      return (
        <DiscoverySearch {...discoverySearchProps()}>
          <ResultsPagination {...props()} />
        </DiscoverySearch>
      );
    },
    {
      info: marked(defaultReadme)
    }
  );
