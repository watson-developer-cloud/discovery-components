import React, { FC } from 'react';
import { storiesOf } from '@storybook/react';
import { radios } from '@storybook/addon-knobs';
import { QueryResult, QueryResultPassage } from 'ibm-watson/discovery/v2';
import DocumentPreview from '../DocumentPreview';
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

const doc = docArtEffects;

storiesOf('DocumentPreview', module)
  .addParameters({ component: DocumentPreview })
  .add('default', () => {
    return (
      <Wrapper>
        <DocumentPreview document={doc} />
      </Wrapper>
    );
  })
  .add('passage highlighting', () => {
    const usedPassage = doc.extracted_metadata.file_type === 'json' ? jsonPassages : passages;
    const docWithPassage = passageSelection(doc, usedPassage);
    const highlight = ((docWithPassage.document_passages as unknown) as QueryResultPassage[])[0];

    return (
      <Wrapper>
        <DocumentPreview document={docWithPassage} highlight={highlight} />
      </Wrapper>
    );
  });

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
