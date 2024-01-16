import { action } from '@storybook/addon-actions';
import MetadataPane from './MetadataPane';
import { mockMetadata } from './__fixtures__/metadata';
import { mockParties } from './__fixtures__/parties';

export default {
  title: 'CIDocument/components/MetadataPane'
};

export const Default = {
  render: () => {
    return (
      <>
        <div style={{ width: '30%' }}>
          <MetadataPane
            metadata={mockMetadata}
            parties={mockParties}
            onActiveMetadataChange={action('on-active-metadata-change')}
            onActivePartyChange={action('on-active-party-change')}
          />
        </div>
      </>
    );
  },

  name: 'default'
};
