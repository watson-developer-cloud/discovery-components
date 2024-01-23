import { action } from '@storybook/addon-actions';

import Section from './Section';
import sectionData from './__fixtures__/sectionData';
import { DocumentStoryWrapper } from 'utils/storybookUtils';

export default {
  title: 'CIDocument/components/Section'
};

export const Simple = {
  render: () => (
    <DocumentStoryWrapper>
      <Section section={sectionData[0]} onFieldClick={action('field-click')} />
    </DocumentStoryWrapper>
  ),

  name: 'simple'
};

export const Complex = {
  render: () => (
    <DocumentStoryWrapper>
      <Section section={sectionData[1]} onFieldClick={action('field-click')} />
    </DocumentStoryWrapper>
  ),

  name: 'complex'
};
