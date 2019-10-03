import React, { useState, ReactElement } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import RichPreviewToolbar from './RichPreviewToolbar';

const RichPreviewToolbarWrapper = (): ReactElement => {
  const [current, setCurrent] = useState(1);

  return (
    <RichPreviewToolbar
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

storiesOf('RichPreview/components/RichPreviewToolbar', module)
  .add('default', () => {
    return (
      <div style={divStyle}>
        <RichPreviewToolbar
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
        <RichPreviewToolbarWrapper />
      </div>
    );
  });
