import { FC } from 'react';
import { FilterGroup, Filter, FilterChangeArgs } from './types';
import { Messages } from './messages';
export type OnFilterChangeFn = (args: FilterChangeArgs) => void;
export type OnFilterClearFn = () => void;
interface FilterPanelProps {
    className?: string;
    filter: Filter | null;
    filterGroups: FilterGroup[] | null;
    messages?: Messages;
    onFilterChange?: OnFilterChangeFn;
    onFilterClear?: OnFilterClearFn;
    title?: string;
}
declare const FilterPanel: FC<FilterPanelProps>;
export default FilterPanel;
