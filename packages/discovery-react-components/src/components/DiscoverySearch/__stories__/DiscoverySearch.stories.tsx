import React, { FC, useContext } from 'react';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { CloudPakForDataAuthenticator } from 'ibm-watson/auth';
import { storiesOf } from '@storybook/react';
import { text, object } from '@storybook/addon-knobs';
import DiscoverySearch, {
  DiscoverySearchProps,
  SearchContext,
  SearchApi
} from '../DiscoverySearch';
import { DummySearchClient } from 'utils/storybookUtils';

const MyComponent: FC<{}> = () => {
  const {
    searchResponseStore: { parameters: searchParameters }
  } = useContext(SearchContext);
  const { performSearch } = useContext(SearchApi);

  return <button onClick={() => performSearch(searchParameters)}>Perform Search</button>;
};

const customSearchClientProps = (): DiscoverySearchProps => ({
  searchClient: new DummySearchClient(),
  projectId: text('Project ID', 'project-id'),
  // @ts-expect-error
  overrideSearchResults: object('Search results object', {
    matching_results: 1,
    results: [
      {
        document_id: 'doc_id'
      }
    ]
  }),
  overrideQueryParameters: object('Query Parameters', {
    naturalLanguageQuery: 'query string',
    query: 'field:value',
    filter: 'field:value',
    aggregation: 'term(field,count:10)',
    return: 'field_1,field_2',
    offset: 0,
    count: 10
  })
});

storiesOf('DiscoverySearch', module)
  .addParameters({ component: DiscoverySearch })
  .add('default', () => {
    const authenticator = new CloudPakForDataAuthenticator({
      url: text('Base URL', 'http://mycluster.com'),
      username: text('Username', 'foo'),
      password: text('Password', 'bar')
    });
    const defaultProps = (): DiscoverySearchProps => ({
      searchClient: new DiscoveryV2({
        authenticator,
        url: text('Release Path Url', 'http://mycluster.com/my_release'),
        version: text('Version Date', '2019-01-01')
      }),
      projectId: text('Project ID', 'project-id')
    });
    return (
      <DiscoverySearch {...defaultProps()}>
        <MyComponent />
      </DiscoverySearch>
    );
  })
  .add('custom search client', () => {
    const props = customSearchClientProps();
    return (
      <DiscoverySearch {...props}>
        <SearchApi.Consumer>
          {({ performSearch }): React.ReactNode => (
            <SearchContext.Consumer>
              {({ searchResponseStore: { parameters: searchParameters } }): React.ReactNode => (
                <button onClick={() => performSearch(searchParameters)}>Perform Search</button>
              )}
            </SearchContext.Consumer>
          )}
        </SearchApi.Consumer>
      </DiscoverySearch>
    );
  });
