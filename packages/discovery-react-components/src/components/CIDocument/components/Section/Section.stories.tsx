import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import Section from './Section';
import sectionData from './__fixtures__/sectionData';
import { DocumentStoryWrapper } from 'utils/storybookUtils';

const stories = storiesOf('CIDocument/components/Section', module);

stories
  .add('simple', () => (
    <DocumentStoryWrapper>
      <Section section={sectionData[0]} onFieldClick={action('field-click')} />
    </DocumentStoryWrapper>
  ))
  .add('complex', () => (
    <DocumentStoryWrapper>
      <Section section={sectionData[1]} onFieldClick={action('field-click')} />
    </DocumentStoryWrapper>
  ));
