import {
  SelectableQueryTermAggregation,
  SelectableQueryTermAggregationResult
} from './searchRefinementInterfaces';
import { findTermAggregations } from './findTermAggregations';
import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';
import get from 'lodash/get';
import unionBy from 'lodash/unionBy';

export const mergeFilterRefinements = (
  aggregations: DiscoveryV2.QueryAggregation[],
  filterFields: SelectableQueryTermAggregation[],
  componentSettingsAggregations: DiscoveryV2.ComponentSettingsAggregation[]
): SelectableQueryTermAggregation[] => {
  if (!aggregations) {
    return [];
  }
  const termAggreations = findTermAggregations(aggregations);
  // add component settings label if it exist's
  const labeledTermAggregtions: SelectableQueryTermAggregation[] = termAggreations.map(
    (termAggregation, i) => {
      if (componentSettingsAggregations[i]) {
        return {
          ...termAggregation,
          label: componentSettingsAggregations[i].label,
          field: termAggregation.field
        };
      } else {
        return termAggregation;
      }
    }
  );

  return labeledTermAggregtions
    .filter(aggregation => {
      return aggregation.results;
    })
    .map((aggregation: SelectableQueryTermAggregation) => {
      const aggregationField = get(aggregation, 'field', '');
      const aggregationResults: DiscoveryV2.QueryTermAggregationResult[] = get(
        aggregation,
        'results',
        []
      );
      const filterRefinementsForField = filterFields.find(
        aggregation => aggregation.field === aggregationField
      );

      if (!!filterRefinementsForField) {
        const filterRefinementResults: SelectableQueryTermAggregationResult[] = get(
          filterRefinementsForField,
          'results',
          []
        );
        const newAggResults: SelectableQueryTermAggregationResult[] = aggregationResults.map(
          (result: DiscoveryV2.QueryTermAggregationResult) => {
            const key = get(result, 'key', '');
            const filterRefinement = filterRefinementResults.find(
              (filterRefinement: SelectableQueryTermAggregationResult) => {
                return filterRefinement.key === key;
              }
            );
            return filterRefinement ? Object.assign({}, result, { selected: true }) : result;
          }
        );

        const selectedNewAggResults = newAggResults.filter(result => result.selected);
        const selectedNewAggAndFilterRefinementResults = unionBy(
          selectedNewAggResults,
          filterRefinementResults,
          'key'
        );

        const unselectedResultsToSlice =
          get(aggregation, 'count', 10) - selectedNewAggAndFilterRefinementResults.length;
        const unselectedNewAggResults = newAggResults
          .filter(result => !result.selected)
          .slice(0, unselectedResultsToSlice);

        return {
          type: 'term',
          field: aggregationField,
          label: aggregation.label,
          results: unionBy(unselectedNewAggResults, selectedNewAggAndFilterRefinementResults, 'key')
        };
      } else {
        return aggregation;
      }
    });
};
