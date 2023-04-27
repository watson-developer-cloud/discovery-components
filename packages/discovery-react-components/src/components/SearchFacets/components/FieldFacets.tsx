import React, { FC, SyntheticEvent } from 'react';
import get from 'lodash/get';
import filter from 'lodash/filter';
import cloneDeep from 'lodash/cloneDeep';
import {
  InternalQueryTermAggregation,
  SelectableQueryTermAggregationResult,
  SearchFilterFacets,
  SelectedFacet
} from '../utils/searchFacetInterfaces';
import { Messages } from '../messages';
import { CollapsibleFacetsGroup } from './FacetsGroups/CollapsibleFacetsGroup';
import { fieldHasCategories } from '../utils/fieldHasCategories';

interface FieldFacetsProps {
  /**
   * Facets configuration with fields and results counts
   */
  allFacets: InternalQueryTermAggregation[];
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
  onFieldFacetsChange: (updatedFacet: Partial<SearchFilterFacets>) => void;
  /**
   * custom handler invoked when any input element changes in the SearchFacets component
   */
  onChange?: (e: SyntheticEvent<HTMLInputElement>) => void;
}

export const FieldFacets: FC<FieldFacetsProps> = ({
  allFacets,
  showMatchingResults,
  messages,
  collapsedFacetsCount,
  onFieldFacetsChange,
  onChange
}) => {
  const getFacetsForNameIndex = (selectedFacetName: string) => {
    const facetsForNameIndex = allFacets.findIndex(facet => {
      if (!facet.name) {
        return facet.field === selectedFacetName;
      }
      return facet.name === selectedFacetName;
    });
    return facetsForNameIndex;
  };

  const handleOnFieldFacetsChange = (selectedFacets: SelectedFacet[]): void => {
    let updatedFacets = cloneDeep(allFacets);
    selectedFacets.forEach(({ selectedFacetName, selectedFacetKey, checked }) => {
      const facetsForNameIndex = getFacetsForNameIndex(selectedFacetName);
      if (facetsForNameIndex > -1) {
        const facetsForName = updatedFacets[facetsForNameIndex];
        const multiselect = get(facetsForName, 'multiple_selections_allowed', true);
        const facetResults: SelectableQueryTermAggregationResult[] = get(
          facetsForName,
          'results',
          []
        );

        // Handle quirky case where toggling between checkboxes and radio buttons when
        //   1. multiselect === false
        //   2. going from 2 facets down to 1
        const selectedFacets = filter(facetResults, ['selected', true]);
        const usingRadioButtons = selectedFacets.length < 2 && !multiselect;
        const selectedFacetResults: SelectableQueryTermAggregationResult[] = facetResults.map(
          result => {
            const key = get(result, 'key', '');

            if (usingRadioButtons) {
              const keySelected = get(result, 'selected', false);
              const isSelectedFacetKey = key === selectedFacetKey;
              return Object.assign({}, result, { selected: isSelectedFacetKey && !keySelected });
            } else {
              return key === selectedFacetKey
                ? Object.assign({}, result, { selected: checked })
                : result;
            }
          }
        );
        updatedFacets[facetsForNameIndex].results = selectedFacetResults;
      }
    });
    onFieldFacetsChange({ filterFields: updatedFacets });
  };

  const handleOnClear = (selectedFacetName: string): void => {
    let updatedFacets = cloneDeep(allFacets);
    const facetsForNameIndex = getFacetsForNameIndex(selectedFacetName);
    if (facetsForNameIndex > -1) {
      const results = updatedFacets[facetsForNameIndex].results || [];
      const deselectedResults = (results as SelectableQueryTermAggregationResult[]).map(result => {
        return { ...result, selected: false };
      });
      updatedFacets[facetsForNameIndex].results = deselectedResults;
      onFieldFacetsChange({ filterFields: updatedFacets });
    }
  };

  return (
    <div>
      {allFacets.map((aggregation: InternalQueryTermAggregation, i: number) => {
        const aggregationResults: SelectableQueryTermAggregationResult[] = get(
          aggregation,
          'results',
          []
        );

        if (aggregationResults.length === 0) {
          return null;
        }
        const hasCategories = fieldHasCategories(aggregation);

        return (
          <CollapsibleFacetsGroup
            key={`collapsible-facet-group-${i}`}
            collapsedFacetsCount={collapsedFacetsCount}
            messages={messages}
            aggregationSettings={aggregation}
            facets={aggregationResults}
            showMatchingResults={showMatchingResults}
            facetsTextField="key"
            hasCategories={hasCategories}
            onClear={handleOnClear}
            onChange={onChange}
            onCollapsibleFacetsGroupChange={handleOnFieldFacetsChange}
          />
        );
      })}
    </div>
  );
};
