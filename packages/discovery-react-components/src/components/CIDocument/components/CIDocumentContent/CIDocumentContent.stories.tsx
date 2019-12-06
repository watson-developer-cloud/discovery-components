import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, radios } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';

import CIDocumentContent from './CIDocumentContent';
import contract from './__fixtures__/contract.json';

const label = 'Document';
// values are `model_id`
const options = {
  Contract: 'contracts'
};
const defaultValue = 'contracts';
const groupId = 'GROUP-DOCUMENTS';

const docs = {
  contracts: contract
};

const storyStyle = `
.story {
  height: 90vh;
  padding: 2rem;
  background-color: #f3f3f3;
}
.story > * {
  background-color: #fff;
}`;

storiesOf('CIDocument/components/CIDocumentContent', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    const modelId = radios(label, options, defaultValue, groupId);

    return (
      <>
        <style>{storyStyle}</style>
        <div className="story">
          <CIDocumentContent
            styles={docs[modelId].styles}
            sections={docs[modelId].sections}
            onItemClick={action('item-click')}
            itemMap={{ byItem: {}, bySection: {} }}
          />
        </div>
      </>
    );
  })
  .add('loading', () => {
    return (
      <>
        <style>
          {storyStyle +
            `.doc {
              overflow: scroll;
            }`}
        </style>
        <div className="story">
          <CIDocumentContent
            className="doc"
            styles={[]}
            sections={[]}
            itemMap={{ byItem: {}, bySection: {} }}
            onItemClick={action('item-click')}
          />
        </div>
      </>
    );
  });
