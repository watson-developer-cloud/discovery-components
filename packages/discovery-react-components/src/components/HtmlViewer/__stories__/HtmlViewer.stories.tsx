import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, radios } from '@storybook/addon-knobs';
import HtmlViewer from '../HtmlViewer';
import ciContract from '../__fixtures__/ci-contract.json';
import ciInvoice from '../__fixtures__/ci-invoice.json';
import ciPo from '../__fixtures__/ci-po.json';
import enrichmentsMock from '../__fixtures__/enrichments-mock.json';
import enrichmentsSimple from '../__fixtures__/enrichments-simple.json';
import enrichmentsNonText from '../__fixtures__/enrichments-nonText.json';
import enrichmentsOverlap from '../__fixtures__/enrichments-overlap.json';
import { getId } from '../../../utils/document/idUtils';
import get from 'lodash/get';
import { action } from '@storybook/addon-actions';

const label = 'Document';

const options = {
  Contract: 'contract',
  Invoice: 'invoice',
  'Purchase Order': 'purchase_order',
  Mock: 'mock',
  Simple: 'simple',
  'Non-text': 'non_text',
  Overlap: 'overlap'
};

const docs = {
  contract: ciContract,
  invoice: ciInvoice,
  purchase_order: ciPo,
  mock: enrichmentsMock,
  simple: enrichmentsSimple,
  non_text: enrichmentsNonText,
  overlap: enrichmentsOverlap
};
const defaultValue = 'contract';
const groupId = 'GROUP-DOCUMENTS';

const STYLE = `
#root {
  overflow: hidden;
}

.story {
  height: 100vh;
}`;

storiesOf('HtmlViewer', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    const modelId = radios(label, options, defaultValue, groupId);
    return (
      <div style={{ overflow: 'hidden' }}>
        <style>{STYLE}</style>
        <div className="story">
          {
            <HtmlViewer
              document={docs[modelId]}
              onActiveItemChange={action('active-item-change')}
              onProcessingSuccess={action('processing-success')}
              onProcessingFailure={action('processing-failure')}
              {...getPropsForModel(modelId)}
            />
          }
        </div>
      </div>
    );
  })
  .add('parse error', () => {
    const badDoc = {
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
        <div className="story">
          {
            <HtmlViewer
              document={badDoc}
              highlightedList={[]}
              onActiveItemChange={action('active-item-change')}
              onProcessingSuccess={action('processing-success')}
              onProcessingFailure={action('processing-failure')}
            />
          }
        </div>
      </div>
    );
  });

const getPropsForModel = (modelId: string) => {
  let props: any = {};
  const enrichment = get(docs[modelId], ['enriched_html', '0', modelId], {});

  switch (modelId) {
    case 'contract':
      props = {
        highlightedList: enrichment.elements.filter((_item: any, index: number) => index % 3 === 2),
        enrichmentFields: [{ path: 'elements' }]
      };
      break;
    case 'invoice':
      props = {
        highlightedList: enrichment.currencies,
        enrichmentFields: [
          {
            path: 'attributes'
          },
          {
            path: 'relations',
            locationData: 'attributes'
          }
        ]
      };
      break;
    case 'purchase_order':
      props = {
        highlightedList: enrichment.total_amounts,
        enrichmentFields: [
          {
            path: 'attributes'
          },
          {
            path: 'relations',
            locationData: 'attributes'
          }
        ]
      };
      break;
    case 'mock':
    case 'overlap':
      props = {
        enrichmentFields: [{ enrichmentPath: 'enriched_text[0].keywords' }]
      };
      break;
    case 'simple':
      props = {
        enrichmentFields: [{ enrichmentPath: 'enriched_text[0].entities' }]
      };
      break;
    case 'non_text':
      props = {
        dataField: 'title',
        enrichmentFields: [{ enrichmentPath: 'enriched_title[0].keywords' }]
      };
      break;
    default:
      break;
  }

  return {
    ...props,
    highlightedList: props.highlightedList ? props.highlightedList.map(getId) : []
  };
};
