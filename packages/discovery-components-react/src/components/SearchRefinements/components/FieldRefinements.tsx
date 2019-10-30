import React, { FC, SyntheticEvent } from 'react';
import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';
import get from 'lodash/get';
import findIndex from 'lodash/findIndex';
import {
  QueryTermAggregation,
  SearchFilterRefinements,
  SelectableAggregationResult
} from '../utils/searchRefinementInterfaces';
import { RefinementsGroup } from './RefinementsGroup';

interface FieldRefinementsProps {
  /**
   * Refinements configuration with fields and results counts
   */
  allRefinements: QueryTermAggregation[];
  /**
   * Callback to handle changes in selected refinements
   */
  onChange: (updatedRefinement: Partial<SearchFilterRefinements>) => void;
}

export const FieldRefinements: FC<FieldRefinementsProps> = ({ allRefinements, onChange }) => {
  const handleOnChange = (
    checked: boolean,
    _id: string,
    event: SyntheticEvent<HTMLInputElement>
  ): void => {
    const target: HTMLInputElement = event.currentTarget;
    const selectedRefinementField = target.getAttribute('data-field');
    const selectedRefinementKey = target.getAttribute('data-key');

    const refinementsForField = allRefinements.find(
      refinement => refinement.field === selectedRefinementField
    );
    if (refinementsForField) {
      const refinementResults: SelectableAggregationResult[] = get(
        refinementsForField,
        'results',
        []
      );
      const selectedRefinementResults: SelectableAggregationResult[] = refinementResults.map(
        result => {
          const key = get(result, 'key', '');
          return key === selectedRefinementKey
            ? Object.assign({}, result, { selected: checked })
            : result;
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
      {allRefinements
        .filter(aggregation => {
          return aggregation.results;
        })
        .map((aggregation: QueryTermAggregation, i: number) => {
          const aggregationResults: DiscoveryV2.AggregationResult[] = get(
            aggregation,
            'results',
            []
          );
          const aggregationField = aggregation.field;
          const orderedAggregationResults = aggregationResults.sort(
            (a, b) => (b.matching_results || 0) - (a.matching_results || 0)
          );

          return (
            <RefinementsGroup
              key={`refinement-group-${aggregationField}-${i}`}
              refinements={orderedAggregationResults}
              onChange={handleOnChange}
              refinementsLabel={aggregationField || ''}
              attributeKeyName="key"
            />
          );
        })}
    </div>
  );
};
