import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, radios } from '@storybook/addon-knobs';

import HtmlView from './HtmlView';
import docJson from '../../__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';

storiesOf('DocumentPreview/components/HtmlView', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    return (
      <div style={{ height: '100%' }}>
        <HtmlView document={docJson} setLoading={(): void => {}} />
      </div>
    );
  })
  .add('table highlighting', () => {
    const label = 'Tables';
    const options = {
      'Table 1': '0',
      'Table 2': '1'
    };
    const defaultValue = '0';
    const groupId = 'GROUP-ID1';
    const tableSelection = radios(label, options, defaultValue, groupId);

    const highlights = [
      {
        table_id: 'c0b39e49-e4cf-4fae-97b0-d547b0af6bc2',
        source_document_id: '903461f8843ef9f10daecd2a14994308',
        collection_id: 'd1714ef9-647c-288c-0000-016fa082490f',
        table_html: 'Something',
        table_html_offset: 274502,
        table: {
          location: { begin: 274994, end: 279877 },
          text: 'Section 7 - Agreed Rates Resource Type Day Rate Project Manager $550 Customer Delivery Manager $800 Product Analyst $800 Solution Architect $800 Technical Architect $800 Handset Developer $400 Server Developer $400 Tester /Test Analyst $400 Release Manager $400 Security Analyst $800 DBA $400 Senior Developer/Development Manager $800 Operations Manager $800 Infrastructure Architect $800 Senior Unix Developer $600 Unix Developer $400 Operations Staff $400 Security Office $400'
        }
      },
      {
        table_id: 'c120373e-34fc-428d-b442-29e20679bc7f',
        source_document_id: '903461f8843ef9f10daecd2a14994308',
        collection_id: 'd1714ef9-647c-288c-0000-016fa082490f',
        table_html: 'Something else',
        table_html_offset: 238525,
        table: {
          location: { begin: 230169, end: 234407 },
          text: 'Supplier Role 3rd Base Ltd Registered number: 981 of 1999 Registered Address: Phone Support Company X Registered number: Registered Address : Development Registered number: Registered Address: Design Registered number: Registered Address: Hosting Registered number: Registered Address: Messaging Registered number: Registered Address: Managed Services (Call Centre)'
        }
      }
    ];

    return (
      <div style={{ height: '100%' }}>
        <HtmlView
          document={docJson}
          highlight={highlights[parseInt(tableSelection, 10)]}
          setLoading={(): void => {}}
        />
      </div>
    );
  })
  .add('passage highlighting', () => {
    const label = 'Passage';
    const options = {
      'Passage 1': '0',
      'Passage 2': '1'
    };
    const defaultValue = '0';
    const groupId = 'GROUP-ID2';
    const tableSelection = radios(label, options, defaultValue, groupId);

    const highlights = [
      {
        passage_text: '5.21 Miscellaneous Costs',
        start_offset: 39611,
        end_offset: 39635,
        field: 'text'
      },
      {
        passage_text: `32.7 Buyer’s and Customer's Regulatory Authorities shall have the benefit of any rights of audit and access to information and documentation provided for in this Agreement to the extent that they relate to the exercise of the Regulatory Authorities' legal rights and/or responsibilities.`,
        start_offset: 138812,
        end_offset: 139099,
        field: 'text'
      }
    ];

    return (
      <div style={{ height: '100%' }}>
        <HtmlView
          document={docJson}
          highlight={highlights[parseInt(tableSelection, 10)]}
          setLoading={(): void => {}}
        />
      </div>
    );
  });
