import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, object, text } from '@storybook/addon-knobs/react';
import { StoryWrapper, DummySearchClient } from '../../../utils/storybookUtils';
import { DiscoverySearch, DiscoverySearchProps } from '../../DiscoverySearch/DiscoverySearch';
import { StructuredQuery } from '../StructuredQuery';
import { defaultMessages } from '../messages';

const props = () => ({
  messages: object("Default messages for the component's text strings", defaultMessages)
});

const discoverySearchProps = (): DiscoverySearchProps => ({
  searchClient: new DummySearchClient(),
  projectId: text('Project ID', 'project-id')
});

storiesOf('StructuredQuery', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    return (
      <StoryWrapper>
        <DiscoverySearch {...discoverySearchProps()}>
          <StructuredQuery {...props()} />
        </DiscoverySearch>
      </StoryWrapper>
    );
  });
