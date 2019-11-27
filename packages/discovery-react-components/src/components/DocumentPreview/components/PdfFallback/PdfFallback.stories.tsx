import React from 'react';
import { storiesOf } from '@storybook/react';

import PdfFallback from './PdfFallback';
import docJson from '../../__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';

storiesOf('DocumentPreview/components/PdfFallback', module).add('default', () => {
  return (
    <div style={{ height: '100%' }}>
      <PdfFallback document={docJson} currentPage={1} setLoading={(): void => {}} />
    </div>
  );
});
