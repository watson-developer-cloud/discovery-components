import { object, text } from '@storybook/addon-knobs';
import { StoryWrapper, DummySearchClient } from 'utils/storybookUtils';
import DiscoverySearch, { DiscoverySearchProps } from 'components/DiscoverySearch/DiscoverySearch';
import StructuredQuery from '../StructuredQuery';
import { defaultMessages } from '../messages';
import { marked } from 'marked';
import defaultReadme from './default.md?raw';
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
      fields: [
        { field: 'field_name_1' },
        { field: 'field_name_2' },
        { field: 'field_name_3' },
        { field: 'field_name_4' },
        { field: 'field_name_5' },
        { field: 'field_name_6' }
      ]
    });
  }
}

const discoverySearchProps = (): DiscoverySearchProps => ({
  searchClient: new DummySearchClientReturnsFields(),
  projectId: text('Project ID', 'project-id')
});

export default {
  title: 'StructuredQuery',

  parameters: {
    component: StructuredQuery
  }
};

export const Default = {
  render: () => {
    return (
      <StoryWrapper>
        <DiscoverySearch {...discoverySearchProps()}>
          <StructuredQuery {...props()} />
        </DiscoverySearch>
      </StoryWrapper>
    );
  },

  name: 'default',

  parameters: {
    info: {
      text: marked.parse(defaultReadme)
    }
  }
};
