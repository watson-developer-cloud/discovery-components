import React from 'react';
import FilterPanel from '@CIDocument/components/FilterPanel/FilterPanel';
import filter from '@CIDocument/components/FilterPanel/__fixtures__/filter.json';
import filterGroups from '@CIDocument/components/FilterPanel/__fixtures__/filterGroups.json';
import { render, BoundFunction, GetByText, fireEvent } from '@testing-library/react';
import { FilterGroup } from '@CIDocument/components/FilterPanel/types';

describe('<FilterPanel />', () => {
  let getByLabelText: BoundFunction<GetByText>, getByText: BoundFunction<GetByText>;
  const onFilterChangeSpy = jest.fn();
  const onFilterClearSpy = jest.fn();

  beforeEach(() => {
    ({ getByLabelText, getByText } = render(
      <FilterPanel
        filter={filter}
        filterGroups={filterGroups as FilterGroup[]}
        onFilterChange={onFilterChangeSpy}
        onFilterClear={onFilterClearSpy}
      />
    ));
  });

  it('displays titles of groups and lists of options', () => {
    getByText('Filter Group A');
    getByText('Filter Group B');
    getByText('Filter Group C');

    getByLabelText('Filter A-1(5)');
    getByLabelText('Filter B-3(8)');
    getByLabelText('Filter C-2(68)');
  });

  it('emits an event when a selection is made', () => {
    expect(onFilterChangeSpy).not.toHaveBeenCalled;

    // Click on option labelled "Filter B-4 (4)"
    fireEvent.click(getByLabelText('Filter B-4(4)'));

    expect(onFilterChangeSpy).toHaveBeenCalledTimes(1);
    expect(onFilterChangeSpy).toHaveBeenCalledWith({
      optionId: 'B4',
      groupId: 'FILTER_GROUP_B',
      type: 'radio',
      checked: true
    });
  });

  it('emits an event when the reset button is pressed', () => {
    expect(onFilterClearSpy).not.toHaveBeenCalled;

    // Click on "Reset filters" button
    fireEvent.click(getByText('Reset filters'));

    expect(onFilterClearSpy).toHaveBeenCalledTimes(1);
  });
});
