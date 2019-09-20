import React from 'react';
import { storiesOf } from '@storybook/react';
import refinementsQueryResponse from './fixtures/refinementsQueryResponse';
import { SearchRefinements } from './SearchRefinements';

storiesOf('SearchRefinements', module).add('default', () => {
  return <SearchRefinements queryResponse={refinementsQueryResponse} />;
});
