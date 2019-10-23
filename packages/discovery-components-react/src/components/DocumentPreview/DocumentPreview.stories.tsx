import React, { FC } from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, radios } from '@storybook/addon-knobs';
import omit from 'lodash/omit';
import DocumentPreview from './DocumentPreview';
import { document as doc } from './__fixtures__/Art Effects.pdf';
import docPO from './__fixtures__/77219743-PO.pdf.json';
import docArtEffects from './__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';
import docHonda from './__fixtures__/ATLA1919NV.PDF.json';
import docSOW from './__fixtures__/SOW 4915017574 SAP System Analyst Services for the GSD - v5.pdf.json';
import passages from './__fixtures__/passages';

interface WrapperProps {
  style?: any;
}
const Wrapper: FC<WrapperProps> = ({ children, style = {} }) => (
  <div style={{ maxWidth: '50rem', margin: '2rem', border: '1px solid black', ...style }}>
    {children}
  </div>
);

storiesOf('DocumentPreview', module)
  .addDecorator(withKnobs)
  .add('render PDF file', () => {
    return (
      <Wrapper>
        <DocumentPreview document={docArtEffects} file={atob(doc)} />
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
        <DocumentPreview document={docs[docname]} />
      </Wrapper>
    );
  })
  .add('render 2nd fallback', () => {
    // passage highlight selection
    const label = 'Passage';
    const options = {
      single: 'single',
      multiline: 'multiline'
    };
    const defaultValue = 'single';
    const groupId = 'GROUP-ID1';
    const passageType = radios(label, options, defaultValue, groupId);

    // create document without text_mappings
    const doc = omit(docArtEffects, 'extracted_metadata.text_mappings');
    // inject single-line passage
    const docWithPassage = {
      ...doc,
      document_passages: [passages[passageType]]
    };

    return (
      <Wrapper style={{ height: '90vh' }}>
        <DocumentPreview document={docWithPassage} />
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
        <DocumentPreview file={atob(doc)} document={docWithPassage} />
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
        <DocumentPreview file={atob(doc)} document={docWithPassage} />
      </Wrapper>
    );
  });
