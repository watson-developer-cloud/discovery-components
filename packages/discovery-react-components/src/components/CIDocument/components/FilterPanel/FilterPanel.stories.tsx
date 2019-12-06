import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import FilterPanel from './FilterPanel';
import filter from './__fixtures__/filter.json';
import filterGroups from './__fixtures__/filterGroups.json';
import { FilterGroup } from './types';

storiesOf('CIDocument/components/FilterPanel', module)
  .add('default', () => (
    <div style={{ maxWidth: '30%', minWidth: '200px' }}>
      <FilterPanel
        filter={filter}
        filterGroups={filterGroups as FilterGroup[]}
        onFilterChange={action('filter-change')}
        onFilterClear={action('filter-clear')}
      />
    </div>
  ))
  .add('loading', () => (
    <div style={{ maxWidth: '30%', minWidth: '200px' }}>
      <FilterPanel filter={null} filterGroups={null} />
    </div>
  ));
