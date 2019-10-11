import React, { FC } from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import omit from 'lodash/omit';
import RichPreview from './RichPreview';
import { document as doc } from './__fixtures__/WEA.Glossary_pdf';
import docJson from './__fixtures__/WEA.Glossary.pdf.json';
import passages from './__fixtures__/passages';

const Wrapper: FC = ({ children }) => (
  <div style={{ margin: '2rem', border: '1px solid black' }}>{children}</div>
);

storiesOf('RichPreview', module)
  .addDecorator(withKnobs)
  .add('render PDF file', () => {
    return (
      <Wrapper>
        <RichPreview document={docJson} file={atob(doc)} />
      </Wrapper>
    );
  })
  .add('render fallback', () => {
    return (
      <Wrapper>
        <RichPreview document={docJson} />
      </Wrapper>
    );
  })
  .add('render 2nd fallback', () => {
    // create document without text_mappings
    const doc = omit(docJson, 'extracted_metadata.text_mappings');
    return (
      <Wrapper>
        <RichPreview document={doc} />
      </Wrapper>
    );
  })
  .add('passage highlight (simple)', () => {
    // inject single-line passage
    const docWithPassage = {
      ...docJson,
      document_passages: [passages.single]
    };
    return (
      <Wrapper>
        <RichPreview file={atob(doc)} document={docWithPassage} />
      </Wrapper>
    );
  })
  .add('passage highlight (complex)', () => {
    // inject multi-line passage
    const docWithPassage = {
      ...docJson,
      document_passages: [passages.multiline]
    };
    return (
      <Wrapper>
        <RichPreview file={atob(doc)} document={docWithPassage} />
      </Wrapper>
    );
  });
