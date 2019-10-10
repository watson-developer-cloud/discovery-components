import React from 'react';
import { storiesOf } from '@storybook/react';

import PdfFallback from './PdfFallback';
import docJson from '../../__fixtures__/WEA.Glossary.pdf.json';

storiesOf('RichPreview/components/PdfFallback', module).add('default', () => {
  return (
    <div style={{ height: '100%' }}>
      <PdfFallback document={docJson} currentPage={1} />
    </div>
  );
});
