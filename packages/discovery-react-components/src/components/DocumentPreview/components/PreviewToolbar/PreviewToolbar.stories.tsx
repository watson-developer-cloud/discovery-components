import React, { useState, ReactElement } from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, number, boolean } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { Json24, Document24 } from '@carbon/icons-react';
import { OverflowMenu, OverflowMenuItem } from 'carbon-components-react';

import { PreviewToolbar, ToolbarAction } from './PreviewToolbar';

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

const userActions: ToolbarAction[] = [
  {
    id: 'annotation',
    renderIcon: Document24,
    iconDescription: 'Annotation view',
    onClick: action('annotation')
  },
  {
    id: 'json',
    renderIcon: Json24,
    iconDescription: 'Json view',
    onClick: action('json')
  },
  {
    id: 'menu',
    render: () => {
      return (
        <OverflowMenu size="sm" flipped>
          <OverflowMenuItem itemText="Menu item 1" />
          <OverflowMenuItem itemText="Menu item 2" />
        </OverflowMenu>
      );
    }
  }
];

storiesOf('DocumentPreview/components/PreviewToolbar', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    const currentPage = number('Current page', 1);
    const totalPage = number('Total pages', 100);
    const hideControls = boolean('Hide controls', false);
    const showUserActions = boolean('Show user-defined actions', false);

    return (
      <div style={divStyle}>
        <PreviewToolbar
          current={currentPage}
          total={totalPage}
          hideControls={hideControls}
          userActions={showUserActions ? userActions : undefined}
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
