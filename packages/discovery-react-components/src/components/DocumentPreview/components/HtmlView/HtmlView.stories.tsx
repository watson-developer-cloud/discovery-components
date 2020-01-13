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
          location: { end: 279877, begin: 274994 },
          text:
            'Section 7 - Agreed Rates Resource Type Day Rate Project Manager $550 Customer Delivery Manager $800 Product Analyst $800 Solution Architect $800 Technical Architect $800 Handset Developer $400 Server Developer $400 Tester /Test Analyst $400 Release Manager $400 Security Analyst $800 DBA $400 Senior Developer/Development Manager $800 Operations Manager $800 Infrastructure Architect $800 Senior Unix Developer $600 Unix Developer $400 Operations Staff $400 Security Office $400'
        }
      },
      {
        table_id: 'c120373e-34fc-428d-b442-29e20679bc7f',
        source_document_id: '903461f8843ef9f10daecd2a14994308',
        collection_id: 'd1714ef9-647c-288c-0000-016fa082490f',
        table_html: 'Something else',
        table_html_offset: 238525,
        table: {
          location: { end: 239777, begin: 239019 },
          text:
            'ii. all ancillary documents relating to this Base Agreement; iii. SOWs pursuant to this Base Agreement and'
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
  });
