import React, { FC, ChangeEvent } from 'react';
import cx from 'classnames';
import { settings } from 'carbon-components';
import { Button, SkeletonText } from 'carbon-components-react';
import { isFilterEmpty, filterContains } from '../../utils/filterUtils';
import { displayNames } from './displayNames';
import { FilterGroup, Filter, FilterChangeArgs } from './types';
import { defaultMessages, Messages } from './messages';

const base = `${settings.prefix}--ci-doc-filter`;

export type OnFilterChangeFn = (args: FilterChangeArgs) => void;
export type OnFilterClearFn = () => void;

interface FilterPanelProps {
  className?: string;
  filter: Filter | null;
  filterGroups: FilterGroup[] | null;
  messages?: Messages;
  onFilterChange?: OnFilterChangeFn;
  onFilterClear?: OnFilterClearFn;
}

const FilterPanel: FC<FilterPanelProps> = ({
  className,
  filter,
  filterGroups,
  messages = defaultMessages,
  onFilterChange,
  onFilterClear
}) => (
  <div className={cx(base, className)} data-testid="Filters">
    {!filter || !filterGroups || filterGroups.length === 0 ? (
      <SkeletonText paragraph={true} lineCount={6} />
    ) : (
      <div>
        <Button
          className="resetButton"
          kind="ghost"
          size="small"
          onClick={onFilterClear}
          disabled={isFilterEmpty(filter)}
        >
          {messages.resetFilterLabel}
        </Button>
        {filterGroups.map(group => (
          <div key={group.id}>
            <h3 className="group-title">{group.title}</h3>
            {group.optionsList &&
              group.optionsList.map(({ id, count, displayName }) => (
                <div key={id}>
                  <input
                    className="input"
                    id={id}
                    type={group.type}
                    name={group.id}
                    disabled={!count}
                    checked={filterContains(filter, group.id, id)}
                    onChange={handleChange(id, group.id, group.type, onFilterChange)}
                  />
                  <label className="label" htmlFor={id}>
                    {displayNames[displayName] || displayName}
                    {!!count && <span className="count">({count})</span>}
                  </label>
                </div>
              ))}
          </div>
        ))}
      </div>
    )}
  </div>
);

function handleChange(
  id: string,
  name: string,
  type: string,
  onFilterChange?: OnFilterChangeFn
): ((event: ChangeEvent<HTMLInputElement>) => void) | undefined {
  if (onFilterChange) {
    return function(event): void {
      const { checked } = event.target;

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
