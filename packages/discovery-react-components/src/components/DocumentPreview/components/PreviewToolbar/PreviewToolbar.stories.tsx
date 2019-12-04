import React, { useState, ReactElement } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { PreviewToolbar } from '@DocumentPreview/components/PreviewToolbar/PreviewToolbar';

const PreviewToolbarWrapper = (): ReactElement => {
  const [current, setCurrent] = useState(1);

  return (
    <PreviewToolbar
      current={current}
      total={100}
      onZoom={action('zoom')}
      onChange={(newPage: number): void => updatePage(newPage, setCurrent)}
    />
  );
};

function updatePage(newPage: number, setCurrent: (page: number) => void): void {
  setCurrent(newPage);
}

const divStyle = {
  marginTop: '2rem'
};

storiesOf('DocumentPreview/components/PreviewToolbar', module)
  .add('default', () => {
    return (
      <div style={divStyle}>
        <PreviewToolbar
          current={1}
          total={100}
          onZoom={action('zoom')}
          onChange={action('page change')}
        />
      </div>
    );
  })
  .add('parent wrapped', () => {
    return (
      <div style={divStyle}>
        <PreviewToolbarWrapper />
      </div>
    );
  });
