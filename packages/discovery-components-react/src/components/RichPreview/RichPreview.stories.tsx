import React, { FC } from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, radios } from '@storybook/addon-knobs';
import omit from 'lodash/omit';
import RichPreview from './RichPreview';
import { document as doc } from './__fixtures__/Art Effects.pdf';
import docPO from './__fixtures__/77219743-PO.pdf.json';
import docArtEffects from './__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';
import docHonda from './__fixtures__/ATLA1919NV.PDF.json';
import docSOW from './__fixtures__/SOW 4915017574 SAP System Analyst Services for the GSD - v5.pdf.json';
import passages from './__fixtures__/passages';

const Wrapper: FC = ({ children }) => (
  <div style={{ maxWidth: '50rem', margin: '2rem', border: '1px solid black' }}>{children}</div>
);

storiesOf('RichPreview', module)
  .addDecorator(withKnobs)
  .add('render PDF file', () => {
    return (
      <Wrapper>
        <RichPreview document={docArtEffects} file={atob(doc)} />
      </Wrapper>
    );
  })
  .add('render fallback', () => {
    // document selection
    const label = 'Document';
    const options = {
      ArtEffects: 'Art Effects',
      PO: 'PO',
      Honda: 'Honda',
      SOW: 'SOW'
    };
    const defaultValue = 'Art Effects';
    const groupId = 'GROUP-ID1';
    const docname = radios(label, options, defaultValue, groupId);

    const docs = {
      PO: docPO,
      'Art Effects': docArtEffects,
      Honda: docHonda,
      SOW: docSOW
    };

    return (
      <Wrapper>
        <RichPreview document={docs[docname]} />
      </Wrapper>
    );
  })
  .add('render 2nd fallback', () => {
    // create document without text_mappings
    const doc = omit(docArtEffects, 'extracted_metadata.text_mappings');
    return (
      <Wrapper>
        <RichPreview document={doc} />
      </Wrapper>
    );
  })
  .add('passage highlight (simple)', () => {
    // inject single-line passage
    const docWithPassage = {
      ...docArtEffects,
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
      ...docArtEffects,
      document_passages: [passages.multiline]
    };
    return (
      <Wrapper>
        <RichPreview file={atob(doc)} document={docWithPassage} />
      </Wrapper>
    );
  });
