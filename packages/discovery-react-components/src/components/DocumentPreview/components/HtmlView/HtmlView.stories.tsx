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
        table_id: '558ada041262d5b0aa02a05429d798c7',
        source_document_id: '7e8ada041262d5b0aa02a05429d798c7',
        collection_id: '8713a92b-28aa-b291-0000-016ddc68aa2a',
        table_html: '<table><tr><th>Hello</th><tr><td>How are ya?</td></tr></table>',
        table_html_offset: 42500,
        table: {
          location: {
            begin: 346735,
            end: 349601
          }
        }
      },
      {
        table_id: '558ada041262d5b0aa02a05429d798c7',
        source_document_id: '7e8ada041262d5b0aa02a05429d798c7',
        collection_id: '8713a92b-28aa-b291-0000-016ddc68aa2a',
        table_html: '<table><tr><th>Hello</th><tr><td>How are ya?</td></tr></table>',
        table_html_offset: 42500,
        table: {
          location: {
            begin: 413504,
            end: 420492
          }
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
