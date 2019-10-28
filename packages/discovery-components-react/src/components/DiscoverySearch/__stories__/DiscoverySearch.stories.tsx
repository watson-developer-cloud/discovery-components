import React, { FC, useContext } from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, object } from '@storybook/addon-knobs/react';
import { action } from '@storybook/addon-actions';
// due to a bug with addon-info and markdown files https://github.com/storybookjs/storybook/pull/6016/ use marked to convert md to html
import marked from 'marked';
import defaultReadme from './default.md';
import customClientReadme from './custom_client.md';

import {
  DiscoverySearch,
  DiscoverySearchProps,
  SearchContext,
  SearchApi
} from '../DiscoverySearch';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';

const MyComponent: FC<{}> = () => {
  const { searchParameters } = useContext(SearchContext);
  const { performSearch } = useContext(SearchApi);

  return <button onClick={() => performSearch(searchParameters)}>Perform Search</button>;
};

class CustomSearchClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async query(queryParams: DiscoveryV1.QueryParams): Promise<any> {
    action('query')(queryParams);
  }

  public async getAutocompletion(
    autocompletionParams: DiscoveryV1.GetAutocompletionParams
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    action('getAutocompletion')(autocompletionParams);
  }

  public async listCollections(
    listCollectionParams: DiscoveryV1.ListCollectionsParams
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<void> {
    action('listCollection')(listCollectionParams);
  }

  public async getComponentSettings(
    getComponentSettingsParams: DiscoveryV1.GetComponentSettingsParams
  ): Promise<void> {
    action('getComponentSettings')(getComponentSettingsParams);
  }
}

const customSearchClientProps = (): DiscoverySearchProps => ({
  searchClient: new CustomSearchClient(),
  projectId: text('Project ID', 'project-id'),
  overrideSearchResults: object('Search results object', {
    matching_results: 1,
    results: [
      {
        document_id: 'doc_id'
      }
    ]
  }),
  overrideQueryParameters: object('Query Parameters', {
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
        projectId: text('Project ID', 'project-id')
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
          <SearchApi.Consumer>
            {({ performSearch }): React.ReactNode => (
              <SearchContext.Consumer>
                {({ searchParameters }): React.ReactNode => (
                  <button onClick={() => performSearch(searchParameters)}>Perform Search</button>
                )}
              </SearchContext.Consumer>
            )}
          </SearchApi.Consumer>
        </DiscoverySearch>
      );
    },
    {
      info: {
        text: marked(customClientReadme)
      }
    }
  );
