import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, object } from '@storybook/addon-knobs/react';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
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

const searchClient = new DiscoveryV1({
  url: 'http://localhost:4000/api',
  username: 'foo',
  password: 'bar',
  version: '2019-01-01'
});

storiesOf('SearchRefinements', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    const exampleProps = props();
    return (
      <DiscoverySearch
        searchClient={searchClient}
        collectionId={'3bbf3413-e6ee-a939-0000-016cc02a54c5'}
        environmentId="default"
        searchResults={refinementsQueryResponse}
      >
        <SearchRefinements {...exampleProps} />
      </DiscoverySearch>
    );
  });
