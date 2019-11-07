import React, { FC } from 'react';
import get from 'lodash/get';
import filter from 'lodash/filter';
import findIndex from 'lodash/findIndex';
import {
  InternalQueryTermAggregation,
  SelectableQueryTermAggregationResult,
  SearchFilterFacets,
  AggregationSettings
} from '../utils/searchFacetInterfaces';
import { Messages } from '../messages';
import { CollapsibleFacetsGroup } from './FacetsGroups/CollapsibleFacetsGroup';

interface FieldFacetsProps {
  /**
   * Facets configuration with fields and results counts
   */
  allFacets: InternalQueryTermAggregation[];
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

export const FieldFacets: FC<FieldFacetsProps> = ({
  allFacets,
  messages,
  collapsedFacetsCount,
  onChange
}) => {
  const handleOnChange = (
    selectedFacetField: string,
    selectedFacetKey: string,
    checked: boolean
  ): void => {
    const facetsForFieldIndex = allFacets.findIndex(facet => facet.field === selectedFacetField);
    if (facetsForFieldIndex > -1) {
      const facetsForField = allFacets[facetsForFieldIndex];
      const multiselect = get(facetsForField, 'multiple_selections_allowed', true);
      const facetResults: SelectableQueryTermAggregationResult[] = get(
        facetsForField,
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
      const newFacetsForField = Object.assign({}, facetsForField, {
        results: selectedFacetResults
      });
      const index = findIndex(allFacets, facet => {
        return facet.field === selectedFacetField;
      });

      allFacets.splice(index, 1, newFacetsForField);
    }
    onChange({ filterFields: allFacets });
  };

  const handleOnClear = (field: string): void => {
    const facetsForFieldIndex = allFacets.findIndex(
      // TODO: switch this to an identifier
      facet => facet.field === field
    );
    if (facetsForFieldIndex > -1) {
      const results = allFacets[facetsForFieldIndex].results || [];
      const deselectedResults = (results as SelectableQueryTermAggregationResult[]).map(result => {
        return { ...result, selected: false };
      });
      allFacets[facetsForFieldIndex].results = deselectedResults;
      onChange({ filterFields: allFacets });
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
        const orderedAggregationResults = aggregationResults.sort(
          (a, b) => (b.matching_results || 0) - (a.matching_results || 0)
        );
        const aggregationSettings: AggregationSettings = {
          label: aggregation.label,
          field: aggregation.field,
          multiple_selections_allowed: aggregation.multiple_selections_allowed
        };

        if (aggregationResults.length === 0) {
          return;
        }

        return (
          <CollapsibleFacetsGroup
            key={`collapsible-facet-group-${i}`}
            collapsedFacetsCount={collapsedFacetsCount}
            messages={messages}
            aggregationSettings={aggregationSettings}
            facets={orderedAggregationResults}
            facetsTextField="key"
            onClear={handleOnClear}
            onChange={handleOnChange}
          />
        );
      })}
    </div>
  );
};
