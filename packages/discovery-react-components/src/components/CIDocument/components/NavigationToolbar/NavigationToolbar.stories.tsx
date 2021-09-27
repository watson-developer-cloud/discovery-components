import React, { useState, Dispatch, SetStateAction } from 'react';
import { storiesOf } from '@storybook/react';
import { action, HandlerFunction } from '@storybook/addon-actions';
import NavigationToolbar from './NavigationToolbar';

const NavToolbarWrapper = () => {
  const [index, setIndex] = useState(1);
  const navAction = action('navigation-change');

  return <NavigationToolbar index={index} max={100} onChange={onChange(navAction, setIndex)} />;
};

function onChange(navAction: HandlerFunction, setIndex: Dispatch<SetStateAction<number>>) {
  return function (newIndex: number): void {
    setIndex(newIndex);
    navAction(newIndex);
  };
}

storiesOf('CIDocument/components/NavigationToolbar', module).add('default', () => (
  <NavToolbarWrapper />
));
