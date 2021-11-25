import React, { useState, ReactElement } from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, number, boolean } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { Json24, Document24 } from '@carbon/icons-react';

import { PreviewToolbar } from './PreviewToolbar';

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

const userActions = [
  {
    id: 'annotation',
    icon: Document24,
    description: 'Annotation view',
    onClick: action('annotation')
  },
  {
    id: 'json',
    icon: Json24,
    description: 'Json view',
    onClick: action('json')
  }
];

storiesOf('DocumentPreview/components/PreviewToolbar', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    const currentPage = number('Current page', 1);
    const totalPage = number('Total pages', 100);
    const hideControls = boolean('Hide controls', false);
    const showPager = boolean('Show pager', true);
    const showZoom = boolean('Show zoom actions', true);
    const showUserActions = boolean('Show user-defined actions', false);

    return (
      <div style={divStyle}>
        <PreviewToolbar
          current={currentPage}
          total={totalPage}
          hideControls={hideControls}
          showPager={showPager}
          showZoom={showZoom}
          actions={showUserActions ? userActions : undefined}
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
