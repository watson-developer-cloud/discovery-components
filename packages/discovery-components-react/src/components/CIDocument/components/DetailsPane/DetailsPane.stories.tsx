import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import DetailsPane from './DetailsPane';
import { Items } from './types';

const mockData: Items[] = [
  {
    heading: 'categories',
    items: [
      {
        label: 'Liability'
      }
    ]
  },
  { heading: 'types', items: ['Nature: Right, Party: Agent', 'Nature: Right, Party: Employee'] },
  {
    heading: 'attributes',
    items: [
      { type: 'Currency', label: 'Currency (1)', link: true },
      { type: 'Number', label: 'Number (1)', link: true }
    ]
  }
];

storiesOf('CIDocument/components/DetailsPane', module).add('DetailsPane', () => {
  return (
    <div style={{ maxWidth: '30%', minWidth: '200px' }}>
      <DetailsPane items={mockData} onActiveLinkChange={action('active-link-change')} />
    </div>
  );
});
