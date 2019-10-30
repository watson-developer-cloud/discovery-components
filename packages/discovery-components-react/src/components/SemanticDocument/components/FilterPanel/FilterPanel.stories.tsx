/* BEGIN_COPYRIGHT
 *
 * IBM Confidential
 * OCO Source Materials
 *
 * 5737-C06
 * (C) Copyright IBM Corp. 2019 All Rights Reserved.
 *
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has been
 * deposited with the U.S. Copyright Office.
 *
 * END_COPYRIGHT
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import FilterPanel from './FilterPanel';
import filter from './__fixtures__/filter.json';
import filterGroups from './__fixtures__/filterGroups.json';
import { FilterGroup } from './types';

storiesOf('SemanticDocument/components/FilterPanel', module)
  .add('default', () => (
    <FilterPanel
      filter={filter}
      filterGroups={filterGroups as FilterGroup[]}
      onFilterChange={action('filter-change')}
      onFilterClear={action('filter-clear')}
    />
  ))
  .add('loading', () => <FilterPanel filter={null} filterGroups={null} />);
