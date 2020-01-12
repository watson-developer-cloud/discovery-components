import React from 'react';
import { storiesOf } from '@storybook/react';

import HtmlView from './HtmlView';
import docJson from '../../__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';

storiesOf('DocumentPreview/components/HtmlView', module).add('default', () => {
  return (
    <div style={{ height: '100%' }}>
      <HtmlView document={docJson} setLoading={(): void => {}} />
    </div>
  );
});
