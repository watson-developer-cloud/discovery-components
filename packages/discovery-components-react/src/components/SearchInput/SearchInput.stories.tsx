import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, boolean } from '@storybook/addon-knobs/react';

import SearchInput from './SearchInput';

export const props = () => ({
  className: text('ClassName', ''),
  type: text('Input Type', 'text'),
  small: boolean('Small', false),
  light: boolean('Light', true),
  placeHolderText: text('Placeholder', 'Placeholder text'),
  labelText: text('Label', 'Label text'),
  closeButtonLabelText: text('Close button label', 'Close button label text'),
  defaultValue: text('Default value', ''),
  id: text('ID', 'discovery-search-input')
});

storiesOf('SearchInput', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    const exampleProps = props();
    return <SearchInput {...exampleProps} />;
  });
