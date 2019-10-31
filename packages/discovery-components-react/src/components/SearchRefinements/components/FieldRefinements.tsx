import React, { FC } from 'react';
import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';
import get from 'lodash/get';
import filter from 'lodash/filter';
import findIndex from 'lodash/findIndex';
import {
  SelectableQueryTermAggregation,
  SelectableQueryTermAggregationResult,
  SearchFilterRefinements
} from '../utils/searchRefinementInterfaces';
import { MultiSelectRefinementsGroup } from './RefinementsGroups/MultiSelectRefinementsGroup';
import { SingleSelectRefinementsGroup } from './RefinementsGroups/SingleSelectRefinementsGroup';

interface FieldRefinementsProps {
  /**
   * Refinements configuration with fields and results counts
   */
  allRefinements: SelectableQueryTermAggregation[];
  /**
   * Override aggregation component settings
   */
  componentSettingsAggregations?: DiscoveryV2.ComponentSettingsAggregation[];
  /**
   * Callback to handle changes in selected refinements
   */
  onChange: (updatedRefinement: Partial<SearchFilterRefinements>) => void;
}

export const FieldRefinements: FC<FieldRefinementsProps> = ({
  allRefinements,
  componentSettingsAggregations,
  onChange
}) => {
  const areMultipleSelectionsAllowed = (aggregationIndex: number) => {
    return get(
      componentSettingsAggregations,
      `[${aggregationIndex}].multiple_selections_allowed`,
      true
    );
  };

  const handleOnChange = (
    selectedRefinementField: string,
    selectedRefinementKey: string,
    checked: boolean
  ): void => {
    const refinementsForFieldIndex = allRefinements.findIndex(
      refinement => refinement.field === selectedRefinementField
    );
    if (refinementsForFieldIndex > -1) {
      const refinementsForField = allRefinements[refinementsForFieldIndex];
      const multiselect = areMultipleSelectionsAllowed(refinementsForFieldIndex);
      const refinementResults: SelectableQueryTermAggregationResult[] = get(
        refinementsForField,
        'results',
        []
      );

      // Handle quirky case where toggling between checkboxes and radio buttons when
      //   1. multiselect === false
      //   2. going from 2 refinements down to 1
      const selectedRefinements = filter(refinementResults, ['selected', true]);
      const usingRadioButtons = selectedRefinements.length < 2 && !multiselect;
      const selectedRefinementResults: SelectableQueryTermAggregationResult[] = refinementResults.map(
        result => {
          const key = get(result, 'key', '');

          if (usingRadioButtons) {
            const keySelected = get(result, 'selected', false);
            const isSelectedRefinementKey = key === selectedRefinementKey;
            return Object.assign({}, result, { selected: isSelectedRefinementKey && !keySelected });
          } else {
            return key === selectedRefinementKey
              ? Object.assign({}, result, { selected: checked })
              : result;
          }
        }
      );
      const newrefinementsForField = Object.assign({}, refinementsForField, {
        results: selectedRefinementResults
      });
      const index = findIndex(allRefinements, refinement => {
        return refinement.field === selectedRefinementField;
      });

      allRefinements.splice(index, 1, newrefinementsForField);
    }
    onChange({ filterFields: allRefinements });
  };

  return (
    <div>
      {allRefinements.map((aggregation: SelectableQueryTermAggregation, i: number) => {
        const multiselect = areMultipleSelectionsAllowed(i);
        const aggregationResults: SelectableQueryTermAggregationResult[] = get(
          aggregation,
          'results',
          []
        );
        const aggregationField = aggregation.field;
        const orderedAggregationResults = aggregationResults.sort(
          (a, b) => (b.matching_results || 0) - (a.matching_results || 0)
        );
        const selectedRefinements = filter(orderedAggregationResults, ['selected', true]);

        if (aggregationResults.length === 0) {
          return;
        }

        if (multiselect || selectedRefinements.length > 1) {
          return (
            <MultiSelectRefinementsGroup
              key={`refinement-group-${aggregationField}-${i}`}
              refinements={orderedAggregationResults}
              onChange={handleOnChange}
              refinementsLabel={aggregationField || ''}
              attributeKeyName="key"
            />
          );
        } else {
          const selectedRefinementText = get(selectedRefinements[0], 'key', '');
          return (
            <SingleSelectRefinementsGroup
              key={`refinement-group-${aggregationField}-${i}`}
              refinements={orderedAggregationResults}
              onChange={handleOnChange}
              refinementsLabel={aggregationField || ''}
              selectedRefinement={selectedRefinementText}
              attributeKeyName="key"
            />
          );
        }
      })}
    </div>
  );
};
