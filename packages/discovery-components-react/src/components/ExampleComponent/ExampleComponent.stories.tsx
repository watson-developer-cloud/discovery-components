import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, boolean, number } from '@storybook/addon-knobs/react';
import { action } from '@storybook/addon-actions';

import ExampleComponent from './ExampleComponent';

// Workaround until we can use addon-smart-knobs for typescript
// https://github.com/storybookjs/addon-smart-knobs/pull/61
export const props = () => ({
  placeholder: text('Placeholder Text', 'Enter search terms'),
  suggestions: { 
    enabled: boolean('Suggestions enabled', true),
    limit: number("Suggestions limit", 3)
  },
  querySubmit: () => action('querySubmitClicked')()
});

storiesOf('ExampleComponent', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    return <ExampleComponent />
  })
  .add('configurable', () => {
      const exampleProps = props();
      return <ExampleComponent {...exampleProps} />
    },
    {
      info: {
        text: `
          This is an example component to demonstrate using Storybook for documentation.
        `,
      }
    }
  );
