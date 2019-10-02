import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import RichPreview from './RichPreview';
import { document as doc1 } from './__fixtures__/intro_to_watson_discovery.pdf';
import { document as doc2 } from './__fixtures__/WEA.Glossary_pdf';
import doc2Json from './__fixtures__/WEA.Glossary.pdf.json';
import passages from './__fixtures__/passages';

storiesOf('RichPreview', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    return <RichPreview file={atob(doc1)} />;
  })
  .add('passage highlight (simple)', () => {
    // inject single-line passage
    const doc = {
      ...doc2Json,
      document_passages: [passages.single]
    };
    return <RichPreview file={atob(doc2)} document={doc} />;
  })
  .add('passage highlight (complex)', () => {
    // inject multi-line passage
    const doc = {
      ...doc2Json,
      document_passages: [passages.multiline]
    };
    return <RichPreview file={atob(doc2)} document={doc} />;
  });
