import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, array, boolean } from '@storybook/addon-knobs/react';

import { ResultsPagination } from './ResultsPagination';

export const props = () => ({
  page: 1,
  pageSizes: array('Page size choices', [10, 20, 30, 40, 50]),
  showPageSizeSelector: boolean('Show selector for number of result items to show per page', true)
});

storiesOf('ResultsPagination', module)
  .addDecorator(withKnobs)
  .add('default', () => {
    const exampleProps = props();
    return <ResultsPagination {...exampleProps} />;
  });
