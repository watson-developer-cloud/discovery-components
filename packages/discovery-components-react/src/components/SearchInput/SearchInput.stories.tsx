import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, boolean, number } from '@storybook/addon-knobs/react';
import { action } from '@storybook/addon-actions';

import SearchInput from './SearchInput';

export const props = () => ({
  // placeholder: text('Placeholder Text', 'Enter search terms'),
  // suggestions: {
  //   enabled: boolean('Suggestions enabled', true),
  //   limit: number('Suggestions limit', 3)
  // },
  // querySubmit: () => action('querySubmitClicked')()
});

storiesOf('SearchInput', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    return <SearchInput />;
  })
  .add(
    'configurable',
    () => {
      const exampleProps = props();
      return <SearchInput {...exampleProps} />;
    },
    {
      info: {
        text: `
          This is a component used to input queries to search Discovery
        `
      }
    }
  );
