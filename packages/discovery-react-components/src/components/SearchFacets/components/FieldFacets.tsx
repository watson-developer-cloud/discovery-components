import React, { FC } from 'react';
import get from 'lodash/get';
import filter from 'lodash/filter';
import {
  InternalQueryTermAggregation,
  SelectableQueryTermAggregationResult,
  SearchFilterFacets
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
    selectedFacetName: string,
    selectedFacetKey: string,
    checked: boolean
  ): void => {
    const facetsForNameIndex = allFacets.findIndex(facet => {
      if (!facet.name) {
        return facet.field === selectedFacetName;
      }
      return facet.name === selectedFacetName;
    });
    if (facetsForNameIndex > -1) {
      const facetsForName = allFacets[facetsForNameIndex];
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
      allFacets[facetsForNameIndex].results = selectedFacetResults;
    }
    onChange({ filterFields: allFacets });
  };

  const handleOnClear = (selectedFacetName: string): void => {
    const facetsForNameIndex = allFacets.findIndex(facet => {
      if (!facet.name) {
        return facet.field === selectedFacetName;
      }
      return facet.name === selectedFacetName;
    });
    if (facetsForNameIndex > -1) {
      const results = allFacets[facetsForNameIndex].results || [];
      const deselectedResults = (results as SelectableQueryTermAggregationResult[]).map(result => {
        return { ...result, selected: false };
      });
      allFacets[facetsForNameIndex].results = deselectedResults;
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

        if (aggregationResults.length === 0) {
          return;
        }

        return (
          <CollapsibleFacetsGroup
            key={`collapsible-facet-group-${i}`}
            collapsedFacetsCount={collapsedFacetsCount}
            messages={messages}
            aggregationSettings={aggregation}
            facets={aggregationResults}
            facetsTextField="key"
            onClear={handleOnClear}
            onChange={handleOnChange}
          />
        );
      })}
    </div>
  );
};
