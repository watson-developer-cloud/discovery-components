import React from 'react';
import { storiesOf } from '@storybook/react';
import { object, text } from '@storybook/addon-knobs/react';
import { StoryWrapper, DummySearchClient } from 'utils/storybookUtils';
import DiscoverySearch, { DiscoverySearchProps } from 'components/DiscoverySearch/DiscoverySearch';
import StructuredQuery from '../StructuredQuery';
import { defaultMessages } from '../messages';
import marked from 'marked';
import defaultReadme from './default.md';
import { createDummyResponsePromise } from 'utils/testingUtils';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { action } from '@storybook/addon-actions';

const props = () => ({
  messages: object("Default messages for the component's text strings", defaultMessages)
});

class DummySearchClientReturnsFields extends DummySearchClient {
  public async listFields(fetchFieldsParams: DiscoveryV2.ListFieldsParams): Promise<any> {
    action('listFields')(fetchFieldsParams);
    return createDummyResponsePromise({
      fields: [{ field: 'field name 1' }, { field: 'field name 2' }]
    });
  }
}

const discoverySearchProps = (): DiscoverySearchProps => ({
  searchClient: new DummySearchClientReturnsFields(),
  projectId: text('Project ID', 'project-id')
});

storiesOf('StructuredQuery', module)
  .addParameters({ component: StructuredQuery })
  .add(
    'default',
    () => {
      return (
        <StoryWrapper>
          <DiscoverySearch {...discoverySearchProps()}>
            <StructuredQuery {...props()} />
          </DiscoverySearch>
        </StoryWrapper>
      );
    },
    {
      info: {
        text: marked(defaultReadme)
      }
    }
  );
