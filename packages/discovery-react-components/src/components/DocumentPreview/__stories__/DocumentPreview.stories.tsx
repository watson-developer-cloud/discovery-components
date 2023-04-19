import React, { ComponentType, FC } from 'react';
import { storiesOf } from '@storybook/react';
import { radios, boolean, number } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { QueryResult, QueryResultPassage } from 'ibm-watson/discovery/v2';
import { SearchContext } from 'components/DiscoverySearch/DiscoverySearch';
import DocumentPreview from '../DocumentPreview';
import { document as docPDF } from '../__fixtures__/Art Effects.pdf';
import docArtEffects from '../__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';
import { document as docQandA } from '../__fixtures__/QandA.pdf';
import documentQandA from '../__fixtures__/QandA.pdf.json';
import passages from '../__fixtures__/passages';
import jsonPassages from '../__fixtures__/jsonPassages';
import omit from 'lodash/omit';
import pickBy from 'lodash/pickBy';

// pulled from pdfjs-dist (see main.js > staticDirs)
const PDF_WORKER_URL = 'pdf.worker.min.js';

interface WrapperProps {
  style?: any;
}
const Wrapper: FC<WrapperProps> = ({ children, style = {} }) => (
  <div style={{ maxWidth: '50rem', margin: '2rem', border: '1px solid black', ...style }}>
    {children}
  </div>
);

storiesOf('DocumentPreview', module)
  .addParameters({ component: DocumentPreview })
  .add('default', () => {
    const [file, doc] = docSelection();
    return (
      <Wrapper>
        <DocumentPreview
          document={doc}
          file={file}
          onChange={action('change')}
          pdfWorkerUrl={PDF_WORKER_URL}
        />
      </Wrapper>
    );
  })
  .add('passage highlighting', () => {
    const [file, doc] = docSelection([
      'pdf',
      'pdf-q-n-a',
      'pdf-fast-path',
      'pdf-no-mappings',
      'html',
      'html-no-mappings',
      'text'
    ]);
    const usedPassage = doc.extracted_metadata.file_type === 'json' ? jsonPassages : passages;
    const docWithPassage = passageSelection(doc, usedPassage);
    const highlight = (docWithPassage.document_passages as unknown as QueryResultPassage[])[0];

    return (
      <Wrapper>
        <DocumentPreview
          document={docWithPassage}
          highlight={highlight}
          file={file}
          onChange={action('change')}
          pdfWorkerUrl={PDF_WORKER_URL}
        />
      </Wrapper>
    );
  })
  .add('table highlight', () => {
    const [file, doc] = docSelection([
      'pdf',
      'pdf-no-mappings',
      'html',
      'html-no-mappings',
      'text'
    ]);
    const docWithTable = tableSelection(doc);
    const highlight = docWithTable.table_results[0];

    return (
      <Wrapper>
        <DocumentPreview
          file={file}
          document={docWithTable}
          highlight={highlight}
          onChange={action('change')}
          pdfWorkerUrl={PDF_WORKER_URL}
        />
      </Wrapper>
    );
  })
  .add('fallback component', () => {
    const doc = {
      document_id: '1234567890',
      extracted_metadata: {
        filename: 'i_am_a_file',
        file_type: 'json'
      },
      result_metadata: {
        collection_id: '1234'
      }
    };
    const fallback = fallbackComponent();

    return (
      <Wrapper>
        <DocumentPreview
          document={doc}
          fallbackComponent={fallback}
          pdfWorkerUrl={PDF_WORKER_URL}
        />
      </Wrapper>
    );
  })
  .add('loading file with timeout', () => {
    const file = atob(docPDF);
    const fetchTime = number('Milliseconds for loading file', 1000);
    const fileFetchTimeout = number(
      'Timeout milliseconds for loading file (fileFetchTimeout)',
      3000
    );
    return (
      <Wrapper>
        <SearchContext.Provider
          value={
            {
              selectedResult: {},
              documentProvider: {
                get: async () => new Promise(resolve => setTimeout(() => resolve(file), fetchTime)),
                provides: () => true
              }
            } as any
          }
        >
          <DocumentPreview
            document={docArtEffects}
            fileFetchTimeout={fileFetchTimeout}
            onChange={action('change')}
            pdfWorkerUrl={PDF_WORKER_URL}
          />
        </SearchContext.Provider>
      </Wrapper>
    );
  });

function docSelection(items = ['pdf', 'html', 'text']): [string | undefined, QueryResult] {
  const label = 'Document Type';
  const options = pickBy(
    {
      PDF: 'pdf',
      'PDF without text location data or html': 'pdf-fast-path',
      'PDF without text location data': 'pdf-no-mappings',
      'Document with `html` property and structure data': 'html',
      'Document with `html` property and no text mappings': 'html-no-mappings',
      'Document with only text': 'text',
      'Q&A PDF': 'pdf-q-n-a'
    },
    (key: string) => items.includes(key)
  );
  const defaultValue = 'pdf';
  const groupId = 'GROUP-ID1';
  const docname: string = radios(label, options, defaultValue, groupId);

  let file, doc;
  switch (docname) {
    case 'pdf':
      file = atob(docPDF);
      doc = docArtEffects;
      break;
    case 'pdf-q-n-a':
      file = atob(docQandA);
      doc = documentQandA;
      break;
    case 'pdf-fast-path':
      file = atob(docPDF);
      doc = omit(docArtEffects, 'html', 'extracted_metadata.text_mappings');
      break;
    case 'pdf-no-mappings':
      file = atob(docPDF);
      doc = omit(docArtEffects, 'extracted_metadata.text_mappings');
      break;
    case 'html':
      doc = docArtEffects;
      break;
    case 'html-no-mappings':
      doc = omit(docArtEffects, 'extracted_metadata.text_mappings');
      break;
    case 'text':
      doc = omit(docArtEffects, 'html');
      break;
    default:
      throw new Error('Unknown radios option');
  }

  return [file, doc];
}

function passageSelection(doc: QueryResult, passages: object): QueryResult {
  const label = 'Passage Type';
  const options = {
    'Single line': 'single',
    'Multi-line': 'multiline',
    'Answer (only for "Q&A PDF")': 'answer'
  };
  const defaultValue = 'single';
  const groupId = 'GROUP-ID1';
  const passageType = radios(label, options, defaultValue, groupId);

  // inject passage
  return {
    ...doc,
    document_passages: [passages[passageType]]
  };
}

function tableSelection(doc: QueryResult): QueryResult {
  // add both table results and passages
  return {
    ...doc,
    document_passages: [passages.single, passages.multiline],
    table_results: [
      {
        table_id: '558ada041262d5b0aa02a05429d798c7',
        source_document_id: '7e8ada041262d5b0aa02a05429d798c7',
        collection_id: '8713a92b-28aa-b291-0000-016ddc68aa2a',
        table_html: '<table><tr><th>Hello</th><tr><td>How are ya?</td></tr></table>',
        table_html_offset: 42500,
        table: {
          location: {
            begin: 274502,
            end: 279920
          }
        }
      }
    ]
  };
}

function fallbackComponent(): ComponentType | undefined {
  const enabled = boolean('Custom fallback (fallbackComponent)', false);
  if (enabled) {
    const Fallback: React.FC<{ document?: QueryResult }> = ({ document }) => (
      <div style={{ width: '100%' }}>
        <h4>Document JSON</h4>
        <pre>{JSON.stringify(document, undefined, 2)}</pre>
      </div>
    );
    return Fallback;
  }
  return undefined;
}
