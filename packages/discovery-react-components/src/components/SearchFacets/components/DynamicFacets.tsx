import React, { FC } from 'react';
import { SelectableDynamicFacets, SearchFilterFacets } from '../utils/searchFacetInterfaces';
import get from 'lodash/get';
import { Messages } from '../messages';
import { CollapsibleFacetsGroup } from './FacetsGroups/CollapsibleFacetsGroup';

interface DynamicFacetsProps {
  /**
   * Dynamic facets text and selected flag
   */
  dynamicFacets: SelectableDynamicFacets[];
  /**
   * i18n messages for the component
   */
  messages: Messages;
  /**
   * Number of facet terms to show when list is collapsed
   */
  collapsedFacetsCount: number;
  /**
   * Callback to handle changes in selected facets
   */
  onChange: (updatedFacet: Partial<SearchFilterFacets>) => void;
}

export const DynamicFacets: FC<DynamicFacetsProps> = ({
  dynamicFacets,
  messages,
  collapsedFacetsCount,
  onChange
}) => {
  const handleOnChange = (
    _selectedFacetField: string,
    selectedFacetKey: string,
    checked: boolean
  ): void => {
    const newDynamicFacets: SelectableDynamicFacets[] = dynamicFacets.map(suggestion => {
      const text = get(suggestion, 'text', '');
      return text === selectedFacetKey
        ? Object.assign({}, suggestion, { selected: checked })
        : suggestion;
    });
    onChange({ filterDynamic: newDynamicFacets });
  };

  const handleOnClear = (): void => {
    const filterDynamic = dynamicFacets.map(facet => {
      return { ...facet, selected: false };
    });
    onChange({ filterDynamic: filterDynamic });
  };

  const aggregationSettings = {
    type: '',
    label: messages.dynamicFacetsLabel,
    multiple_selections_allowed: true,
    field: '',
    name: ''
  };

  return (
    <CollapsibleFacetsGroup
      aggregationSettings={aggregationSettings}
      collapsedFacetsCount={collapsedFacetsCount}
      facets={dynamicFacets}
      facetsTextField="text"
      onChange={handleOnChange}
      onClear={handleOnClear}
      messages={messages}
      hasCategories={false}
    />
  );
};
