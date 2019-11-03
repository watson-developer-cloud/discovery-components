import React, { FC } from 'react';
import get from 'lodash/get';
import filter from 'lodash/filter';
import findIndex from 'lodash/findIndex';
import {
  SelectableQueryTermAggregation,
  SelectableQueryTermAggregationResult,
  SearchFilterRefinements,
  AggregationSettings
} from '../utils/searchRefinementInterfaces';
import { Messages } from '../messages';
import { CollapsableRefinementsGroup } from './RefinementsGroups/CollapsableRefinementsGroup';

interface FieldRefinementsProps {
  /**
   * Refinements configuration with fields and results counts
   */
  allRefinements: SelectableQueryTermAggregation[];
  /**
   * i18n messages for the component
   */
  messages: Messages;
  /**
   * Number of refinement terms to show when list is collapsed
   */
  collapsedRefinementsCount: number;
  /**
   * Callback to handle changes in selected refinements
   */
  onChange: (updatedRefinement: Partial<SearchFilterRefinements>) => void;
}

export const FieldRefinements: FC<FieldRefinementsProps> = ({
  allRefinements,
  messages,
  collapsedRefinementsCount,
  onChange
}) => {
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
      const multiselect = get(refinementsForField, 'multiple_selections_allowed', true);
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

  const handleOnClear = (field: string): void => {
    const refinementsForFieldIndex = allRefinements.findIndex(
      // TODO: switch this to an identifier
      refinement => refinement.field === field
    );
    if (refinementsForFieldIndex > -1) {
      const results = allRefinements[refinementsForFieldIndex].results || [];
      const deselectedResults = (results as SelectableQueryTermAggregationResult[]).map(result => {
        return { ...result, selected: false };
      });
      allRefinements[refinementsForFieldIndex].results = deselectedResults;
      onChange({ filterFields: allRefinements });
    }
  };

  return (
    <div>
      {allRefinements.map((aggregation: SelectableQueryTermAggregation, i: number) => {
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
          <CollapsableRefinementsGroup
            key={`collapsable-refinement-group-${i}`}
            collapsedRefinementsCount={collapsedRefinementsCount}
            messages={messages}
            aggregationSettings={aggregationSettings}
            refinements={orderedAggregationResults}
            refinementsTextField="key"
            onClear={handleOnClear}
            onChange={handleOnChange}
          />
        );
      })}
    </div>
  );
};
