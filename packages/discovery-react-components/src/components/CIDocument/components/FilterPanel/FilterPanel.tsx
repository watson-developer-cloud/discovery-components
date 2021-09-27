import React, { FC } from 'react';
import cx from 'classnames';
import { settings } from 'carbon-components';
import {
  Button,
  SkeletonText,
  Checkbox as CarbonCheckbox,
  RadioButton as CarbonRadio
} from 'carbon-components-react';
import { isFilterEmpty, filterContains } from 'components/CIDocument/utils/filterUtils';
import { displayNames } from './displayNames';
import { FilterGroup, Filter, FilterChangeArgs } from './types';
import { defaultMessages, Messages } from './messages';

const base = `${settings.prefix}--ci-doc-filter`;

export type OnFilterChangeFn = (args: FilterChangeArgs) => void;
export type OnFilterClearFn = () => void;

const inputTagTypes = {
  checkbox: CarbonCheckbox,
  radio: CarbonRadio
};

interface FilterPanelProps {
  className?: string;
  filter: Filter | null;
  filterGroups: FilterGroup[] | null;
  messages?: Messages;
  onFilterChange?: OnFilterChangeFn;
  onFilterClear?: OnFilterClearFn;
  title?: string;
}

const FilterPanel: FC<FilterPanelProps> = ({
  className,
  filter,
  filterGroups,
  messages = defaultMessages,
  onFilterChange,
  onFilterClear
}) => {
  const loading = !filter || !filterGroups || filterGroups.length === 0;
  return (
    <div
      className={cx(base, className, {
        skeletons: loading
      })}
      data-testid="CIDocument_filterPanel"
    >
      {loading ? (
        <SkeletonText paragraph={true} lineCount={6} />
      ) : (
        <div>
          <div className="filterTitle">{messages.filterTitle}</div>
          <Button
            className="resetButton"
            kind="ghost"
            size="small"
            onClick={onFilterClear}
            disabled={filter && isFilterEmpty(filter)}
          >
            {messages.resetFilterLabel}
          </Button>
          <div className="groups">
            {filterGroups &&
              filterGroups.map(group => (
                <div key={group.id} className="group" aria-label={group.title} role="group">
                  <h3 className="group-title">{group.title}</h3>
                  {group.optionsList &&
                    group.optionsList.map(({ id, count, displayName }) => {
                      const InputTag = inputTagTypes[group.type];
                      const labelText = (
                        <>
                          {displayNames[displayName] || displayName}
                          {!!count && <span className="count">({count})</span>}
                        </>
                      );
                      return (
                        InputTag && (
                          <InputTag
                            key={`${group.id}-${id}`}
                            id={`${group.id}-${id}`}
                            className="group-option input"
                            labelText={labelText}
                            name={group.id}
                            disabled={!count}
                            checked={filter && filterContains(filter, group.id, id)}
                            onChange={handleChange(id, group.id, group.type, onFilterChange)}
                          />
                        )
                      );
                    })}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

function handleChange(
  id: string,
  name: string,
  type: string,
  onFilterChange?: OnFilterChangeFn
): ((value: boolean | string) => void) | undefined {
  if (onFilterChange) {
    return function (value): void {
      // value is string for radio buttons, boolean for checkbox
      // Always send true for radio buttons; otherwise, send along checkbox boolean
      const checked: boolean = typeof value === 'string' || value;
      onFilterChange({
        optionId: id,
        groupId: name,
        type,
        checked
      });
    };
  }
  return undefined;
}

export default FilterPanel;
