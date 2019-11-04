import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, radios } from '@storybook/addon-knobs';
import CIDocument from './CIDocument';
import contract from './__fixtures__/contract.json';
import invoice from './__fixtures__/invoice.json';
import po from './__fixtures__/purchaseOrder.json';

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
.story {
  height: 100vh;
}`;

storiesOf('CIDocument', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    const modelId = radios(label, options, defaultValue, groupId);
    return (
      <>
        <style>{STYLE}</style>
        <div className="story">{<CIDocument document={docs[modelId]} />}</div>
      </>
    );
  })
  .add('parse error', () => {
    const badDoc = {};

    return (
      <>
        <style>{STYLE}</style>
        <div className="story">{<CIDocument document={badDoc} />}</div>
      </>
    );
  });
