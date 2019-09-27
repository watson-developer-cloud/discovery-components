import React, { useContext } from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, object } from '@storybook/addon-knobs/react';
import { action } from '@storybook/addon-actions';
// due to a bug with addon-info and markdown files https://github.com/storybookjs/storybook/pull/6016/ use marked to convert md to html
import marked from 'marked';
import defaultReadme from './default.md';
import customClientReadme from './custom_client.md';

import { DiscoverySearch, DiscoverySearchProps, SearchContext } from '../DiscoverySearch';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';

const MyComponent: React.SFC<{}> = () => {
  const { searchParameters } = useContext(SearchContext);

  return <div>{JSON.stringify(searchParameters)}</div>;
};

class CustomSearchClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async query(queryParams: DiscoveryV1.QueryParams): Promise<any> {
    action('query')(queryParams);
  }
}

const customSearchClientProps = (): DiscoverySearchProps => ({
  searchClient: new CustomSearchClient(),
  environmentId: text('Environment ID', 'default'),
  collectionId: text('Collection ID', 'coll-id'),
  searchResults: object('Search results object', {
    matching_results: 1,
    results: [
      {
        document_id: 'doc_id'
      }
    ]
  }),
  queryParameters: object('Query Parameters', {
    natural_language_query: 'query string',
    query: 'field:value',
    filter: 'field:value',
    aggregation: 'term(field,count:10)',
    return: 'field_1,field_2',
    offset: 0,
    count: 10
  })
});

storiesOf('DiscoverySearch', module)
  .addDecorator(withKnobs)
  .add(
    'default',
    () => {
      const defaultProps = (): DiscoverySearchProps => ({
        searchClient: new DiscoveryV1({
          username: text('Username', 'foo'),
          password: text('Password', 'bar'),
          version: text('Version Date', '2019-01-01')
        }),
        environmentId: text('Environment ID', 'default'),
        collectionId: text('Collection ID', 'coll-id')
      });
      return (
        <DiscoverySearch {...defaultProps()}>
          <MyComponent />
        </DiscoverySearch>
      );
    },
    {
      info: {
        text: marked(defaultReadme)
      }
    }
  )
  .add(
    'custom search client',
    () => {
      const props = customSearchClientProps();
      return (
        <DiscoverySearch {...props}>
          <SearchContext.Consumer>
            {({ onSearch }): React.ReactNode => <button onClick={onSearch}>Perform Search</button>}
          </SearchContext.Consumer>
        </DiscoverySearch>
      );
    },
    {
      info: {
        text: marked(customClientReadme)
      }
    }
  );
