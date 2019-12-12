import React, { FC } from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, radios } from '@storybook/addon-knobs';
import omit from 'lodash/omit';
import { QueryResult, QueryResultPassage } from 'ibm-watson/discovery/v2';
import DocumentPreview from '../DocumentPreview';
import { document as docPDF } from '../__fixtures__/Art Effects.pdf';
import docArtEffects from '../__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';
import passages from '../__fixtures__/passages';
import jsonPassages from '../__fixtures__/jsonPassages';

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
  .addDecorator(withKnobs)
  .add('default', () => {
    const [file, doc] = docSelection();
    return (
      <Wrapper>
        <DocumentPreview file={file} document={doc} />
      </Wrapper>
    );
  })
  .add('passage highlighting', () => {
    const [file, doc] = docSelection();
    const usedPassage = doc.extracted_metadata.file_type === 'json' ? jsonPassages : passages;
    const docWithPassage = passageSelection(doc, usedPassage);
    const highlight = ((docWithPassage.document_passages as unknown) as QueryResultPassage[])[0];

    return (
      <Wrapper>
        <DocumentPreview file={file} document={docWithPassage} highlight={highlight} />
      </Wrapper>
    );
  })
  .add('table highlight', () => {
    const [file, doc] = docSelection();
    const docWithTable = tableSelection(doc);
    const highlight = docWithTable.table_results[0];

    return (
      <Wrapper>
        <DocumentPreview file={file} document={docWithTable} highlight={highlight} />
      </Wrapper>
    );
  });

storiesOf('DocumentPreview/components/DocumentPreview', module)
  .addParameters({ component: DocumentPreview })
  .addDecorator(withKnobs)
  .add('render fallback', () => {
    // document selection
    const label = 'Document';
    const options = {
      ArtEffects: 'Art Effects'
    };
    const defaultValue = 'Art Effects';
    const groupId = 'GROUP-ID1';
    const docname = radios(label, options, defaultValue, groupId);

    const docs = {
      'Art Effects': docArtEffects
    };

    return (
      <Wrapper>
        <DocumentPreview document={docs[docname]} />
      </Wrapper>
    );
  });

function docSelection(): [string | undefined, QueryResult] {
  const label = 'Document Type';
  const options = {
    PDF: 'pdf',
    'Document with structure data': 'structure',
    'Document without structure data': 'simple'
  };
  const defaultValue = 'pdf';
  const groupId = 'GROUP-ID1';
  const docname = radios(label, options, defaultValue, groupId);

  let file, doc;
  switch (docname) {
    case 'pdf':
      file = atob(docPDF);
      doc = docArtEffects;
      break;
    case 'structure':
      doc = docArtEffects;
      break;
    case 'simple':
      doc = omit(docArtEffects, 'extracted_metadata.text_mappings');
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
    'Multi-line': 'multiline'
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
            begin: 346183,
            end: 349624
          }
        }
      }
    ]
  };
}
