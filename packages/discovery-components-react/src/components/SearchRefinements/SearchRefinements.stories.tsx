import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, object } from '@storybook/addon-knobs/react';
import { SearchRefinements } from './SearchRefinements';
import { DiscoverySearch } from '../DiscoverySearch/DiscoverySearch';
import refinementsQueryResponse from './fixtures/refinementsQueryResponse';

export const props = () => ({
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
}

storiesOf('SearchRefinements', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    const exampleProps = props();
    const aggregations = refinementsQueryResponse.aggregations;
    return (
      <div style={{ padding: '1rem', backgroundColor: '#f3f3f3' }}>
        <DiscoverySearch
          searchClient={new DummyClient()}
          projectId="project-id"
          searchResults={refinementsQueryResponse}
          aggregationResults={{ aggregations }}
        >
          <SearchRefinements {...exampleProps} />
        </DiscoverySearch>
      </div>
    );
  });
