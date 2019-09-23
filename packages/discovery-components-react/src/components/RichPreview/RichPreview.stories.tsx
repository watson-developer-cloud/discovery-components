import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';

import RichPreview from './RichPreview';
import { document } from './__fixtures__/intro_to_watson_discovery';

storiesOf('RichPreview', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    return <RichPreview file={atob(document)} />;
  });
