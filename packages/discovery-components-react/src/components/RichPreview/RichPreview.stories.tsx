import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import RichPreview from './RichPreview';
import { document as doc } from './__fixtures__/WEA.Glossary_pdf';
import docJson from './__fixtures__/WEA.Glossary.pdf.json';
import passages from './__fixtures__/passages';

storiesOf('RichPreview', module)
  .addDecorator(withKnobs)
  .add('render PDF file', () => {
    return <RichPreview document={docJson} file={atob(doc)} />;
  })
  .add('render fallback', () => {
    return <RichPreview document={docJson} />;
  })
  .add('passage highlight (simple)', () => {
    // inject single-line passage
    const docWithPassage = {
      ...docJson,
      document_passages: [passages.single]
    };
    return <RichPreview file={atob(doc)} document={docWithPassage} />;
  })
  .add('passage highlight (complex)', () => {
    // inject multi-line passage
    const docWithPassage = {
      ...docJson,
      document_passages: [passages.multiline]
    };
    return <RichPreview file={atob(doc)} document={docWithPassage} />;
  });
