import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import MetadataPane from '@CIDocument/components/MetadataPane/MetadataPane';
import { mockMetadata } from '@CIDocument/components/MetadataPane/__fixtures__/metadata';
import { mockParties } from '@CIDocument/components/MetadataPane/__fixtures__/parties';

storiesOf('CIDocument/components/MetadataPane', module).add('default', () => {
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
});
