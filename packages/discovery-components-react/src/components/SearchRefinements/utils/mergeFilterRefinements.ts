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
  configuration: DiscoveryV2.QueryTermAggregation[]
): SelectableQueryTermAggregation[] => {
  if (!aggregations) {
    return [];
  }

  return findTermAggregations(aggregations)
    .filter(aggregation => {
      return aggregation.results;
    })
    .map((aggregation: DiscoveryV2.QueryTermAggregation) => {
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
        const fieldConfigurationCount = configuration.find(
          config => config.field === aggregationField
        );
        const unselectedResultsToSlice =
          get(fieldConfigurationCount, 'count', 10) -
          selectedNewAggAndFilterRefinementResults.length;
        const unselectedNewAggResults = newAggResults
          .filter(result => !result.selected)
          .slice(0, unselectedResultsToSlice);

        return {
          type: 'term',
          field: aggregationField,
          results: unionBy(unselectedNewAggResults, selectedNewAggAndFilterRefinementResults, 'key')
        };
      } else {
        return aggregation;
      }
    });
};
