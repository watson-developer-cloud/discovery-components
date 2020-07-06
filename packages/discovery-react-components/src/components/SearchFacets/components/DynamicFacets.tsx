import React, { FC, SyntheticEvent } from 'react';
import {
  SelectableDynamicFacets,
  SearchFilterFacets,
  SelectedFacet
} from '../utils/searchFacetInterfaces';
import cloneDeep from 'lodash/cloneDeep';
import { Messages } from '../messages';
import { CollapsibleFacetsGroup } from './FacetsGroups/CollapsibleFacetsGroup';

interface DynamicFacetsProps {
  /**
   * Dynamic facets text and selected flag
   */
  dynamicFacets: SelectableDynamicFacets[];
  /**
   * Show matching documents count as part of label
   */
  showMatchingResults: boolean;
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
  onSearchFacetsChange: (updatedFacet: Partial<SearchFilterFacets>) => void;
  /**
   * Exposed onChange function for external use
   */
  onChange?: (e: SyntheticEvent<HTMLInputElement>) => void;
}

export const DynamicFacets: FC<DynamicFacetsProps> = ({
  dynamicFacets,
  showMatchingResults,
  messages,
  collapsedFacetsCount,
  onSearchFacetsChange,
  onChange
}) => {
  const handleOnChange = (selectedFacets: SelectedFacet[]): void => {
    let updatedFacets = cloneDeep(dynamicFacets);
    selectedFacets.map(({ selectedFacetKey, checked }) => {
      const facetKeyIndex = dynamicFacets.findIndex(facet => facet.text === selectedFacetKey);
      if (facetKeyIndex > -1) {
        updatedFacets[facetKeyIndex].selected = checked;
      }
    });
    onSearchFacetsChange({ filterDynamic: updatedFacets });
  };

  const handleOnClear = (): void => {
    const filterDynamic = dynamicFacets.map(facet => {
      return { ...facet, selected: false };
    });
    onSearchFacetsChange({ filterDynamic: filterDynamic });
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
      showMatchingResults={showMatchingResults}
      facetsTextField="text"
      onFieldFacetsChange={handleOnChange}
      onChange={onChange}
      onClear={handleOnClear}
      messages={messages}
      hasCategories={false}
    />
  );
};
