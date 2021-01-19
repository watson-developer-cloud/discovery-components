import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, radios } from '@storybook/addon-knobs';
import CIDocument from '../CIDocument';
import contract from '../__fixtures__/contract.json';
import invoice from '../__fixtures__/invoice-index_op.json';
import po from '../__fixtures__/po-index_op.json';

const label = 'Document';

const options = {
  Contract: 'contracts',
  Invoice: 'invoices',
  'Purchase Order': 'purchase_orders'
};

const docs = {
  contracts: contract,
  invoices: invoice,
  purchase_orders: po
};
const defaultValue = 'contracts';
const groupId = 'GROUP-DOCUMENTS';

const STYLE = `
#root {
  overflow: hidden;
}

.story {
  height: 100vh;
}`;

storiesOf('CIDocument', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    const modelId = radios(label, options, defaultValue, groupId);
    return (
      <div style={{ overflow: 'hidden' }}>
        <style>{STYLE}</style>
        <div className="story">{<CIDocument document={docs[modelId]} />}</div>
      </div>
    );
  })
  .add('parse error', () => {
    const badDoc = {
      document_id: 'document_id',
      result_metadata: {
        collection_id: 'collection_id'
      },
      extracted_metadata: {
        publicationdate: '2018-10-24',
        sha1: '754836ffd690207d39b9f8db08b8099e787c61fa',
        filename: 'Art Effects Koya Creative Base TSA 2008.pdf',
        file_type: 'pdf',
        title: 'Microsoft Word - Art Effects Koya Creative Base TSA 2008.doc'
      }
    };

    return (
      <div style={{ overflow: 'hidden' }}>
        <style>{STYLE}</style>
        <div className="story">{<CIDocument document={badDoc} />}</div>
      </div>
    );
  });
