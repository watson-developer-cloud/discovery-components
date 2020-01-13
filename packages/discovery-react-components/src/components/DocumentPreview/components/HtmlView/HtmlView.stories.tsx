import React from 'react';
import { storiesOf } from '@storybook/react';

import HtmlView from './HtmlView';
import docJson from '../../__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';

storiesOf('DocumentPreview/components/HtmlView', module)
  .add('default', () => {
    return (
      <div style={{ height: '100%' }}>
        <HtmlView document={docJson} setLoading={(): void => {}} />
      </div>
    );
  })
  .add('table highlighting', () => {
    const docWithTable = {
      ...docJson,
      table_results: [
        {
          table_id: '558ada041262d5b0aa02a05429d798c7',
          source_document_id: '7e8ada041262d5b0aa02a05429d798c7',
          collection_id: '8713a92b-28aa-b291-0000-016ddc68aa2a',
          table_html: '<table><tr><th>Hello</th><tr><td>How are ya?</td></tr></table>',
          table_html_offset: 42500,
          table: {
            location: {
              begin: 341939,
              end: 344508
            }
          }
        }
      ]
    };
    const highlight = docWithTable.table_results[0];

    return (
      <div style={{ height: '100%' }}>
        <HtmlView document={docWithTable} highlight={highlight} setLoading={(): void => {}} />
      </div>
    );
  });
