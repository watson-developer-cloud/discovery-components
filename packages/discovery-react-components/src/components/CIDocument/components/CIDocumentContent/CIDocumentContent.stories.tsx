import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, radios } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';

import CIDocumentContent from './CIDocumentContent';
import contract from './__fixtures__/contract.json';

const label = 'Document';
// values are `model_id`
const options = {
  Contract: 'contracts',
  ShortDocument: 'shortDocument',
  LongDocument: 'longDocument'
};
const defaultValue = 'contracts';
const groupId = 'GROUP-DOCUMENTS';

const shortContent = 'short.';
const longContent = (() => {
  let content = '';
  while (content.length < 4092) {
    content += 'very ';
  }
  return `${content} long.`;
})();

const shortDocument = {
  document_id: 'document1',
  title: 'Document 1',
  sections: [
    {
      html: '<p data-child-begin="0" data-child-end="10">Chapter 1\n</p>'
    },
    {
      html: `<p data-child-begin="10" data-child-end="${
        shortContent.length + 11
      }">${shortContent}\n</p>`
    }
  ]
};

const longDocument = {
  document_id: 'document2',
  title: 'Document 2',
  sections: [
    {
      html: '<p data-child-begin="0" data-child-end="10">Chapter 2\n</p>'
    },
    {
      html: `<p data-child-begin="10" data-child-end="${
        longContent.length + 11
      }">${longContent}\n</p>`
    }
  ]
};

const docs = {
  contracts: contract,
  shortDocument: shortDocument,
  longDocument: longDocument
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
            documentId={docs[modelId].document_id}
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
            documentId={''}
          />
        </div>
      </>
    );
  });
