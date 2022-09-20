import React from 'react';
import { storiesOf } from '@storybook/react';
import { text, boolean, object, number, select } from '@storybook/addon-knobs';
import { StoryWrapper, DummySearchClient } from 'utils/storybookUtils';
import DiscoverySearch, { DiscoverySearchProps } from 'components/DiscoverySearch/DiscoverySearch';
import SearchResults from '../SearchResults';
import overrideSearchResults from '../__fixtures__/searchResults';
import overrideCollectionsResults from '../__fixtures__/collectionsResponse';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { action } from '@storybook/addon-actions';
import { createDummyResponsePromise } from 'utils/testingUtils';
import trimSearchResults from './utils/trimSearchResults';
import cloneDeep from 'lodash/cloneDeep';
import { defaultMessages } from '../messages';

const props = () => ({
  bodyField: text(
    'Field on the result that will be displayed if there is no passage or usePassages is set to false (bodyField)',
    'text'
  ),
  resultTitleField: select(
    'Field on the result that will be used for the title (resultTitleField)',
    { 'extractedMetadata.title': 'extracted_metadata.title', title: 'title' },
    'extracted_metadata.title'
  ),
  resultLinkField: select(
    'Field on the result that will be used for the result link (resultLinkField)',
    {
      'Select Field': undefined,
      linkField: 'linkField'
    },
    undefined
  ),
  resultLinkTemplate: text(
    'Field on the result that will be used for the title (resultLinkTemplate)',
    'http://example.com/subdomain/{{document_id}}'
  ),
  showTablesOnlyToggle: boolean(
    'Display a toggle for showing table results only (showTablesOnlyToggle)',
    false
  ),
  showTablesOnly: boolean('Override to show table results only (showTablesOnly)', false),
  usePassages: boolean('Use passages when rendering the results (usePassages)', true),
  passageLength: number('Passage length, between 50 and 2000 (passageLength)', 400),
  dangerouslyRenderHtml: boolean('Render passages as HTML (dangerouslyRenderHtml)', false),
  passageTextClassName: select(
    'ClassName for styling passage text and highlights (passageTextClassName)',
    {
      null: '',
      'Yellow passage highlights': 'yellow',
      'Red passage highlights': 'red',
      'Green passage highlights': 'green'
    },
    ''
  ),
  messages: object("Default messages for the component's text strings", defaultMessages)
});

class OverrideableDummySearchClient extends DummySearchClient {
  public async listCollections(
    listCollectionParams: DiscoveryV2.ListCollectionsParams
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    action('listCollection')(listCollectionParams);
    return createDummyResponsePromise(overrideCollectionsResults);
  }
}

const discoverySearchProps = (knobValues: any): DiscoverySearchProps => {
  const trimmedSearchResults = trimSearchResults(
    cloneDeep(overrideSearchResults),
    knobValues.passageLength,
    knobValues.bodyField
  );
  return {
    searchClient: new OverrideableDummySearchClient(),
    projectId: text('Project ID', 'project-id'),
    overrideSearchResults: trimmedSearchResults,
    overrideCollectionsResults
  };
};

storiesOf('SearchResults', module)
  .addParameters({ component: SearchResults })
  .add('default', () => {
    return (
      <StoryWrapper>
        <DiscoverySearch {...discoverySearchProps(props())}>
          <style
            dangerouslySetInnerHTML={{
              __html: `
            .red em { background-color: #ff9191 }
            .yellow em { background-color: yellow }
            .green em { background-color: #a1ffb7 }
          `
            }}
          />
          <SearchResults {...props()} />
        </DiscoverySearch>
      </StoryWrapper>
    );
  });
