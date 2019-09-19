import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, array } from '@storybook/addon-knobs/react';

import { ResultsPagination } from './ResultsPagination';

export const props = () => ({
  page: 1,
  pageSizes: array('Page size choices', [10, 20, 30, 40, 50])
});

storiesOf('ResultsPagination', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    const exampleProps = props();
    return <ResultsPagination {...exampleProps} />;
  });
