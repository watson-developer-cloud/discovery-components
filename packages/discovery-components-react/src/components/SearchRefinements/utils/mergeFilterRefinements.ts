import { SearchFilterTransform } from './searchFilterTransform';
import { QueryTermAggregation, SelectableAggregationResult } from './searchRefinementInterfaces';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import get from 'lodash.get';
import unionBy from 'lodash/unionBy';

export const mergeFilterRefinements = (
  aggregations: DiscoveryV1.QueryAggregation[],
  filter: string,
  configuration: QueryTermAggregation[]
) => {
  if (!aggregations) {
    return [];
  }

  const filterRefinements = SearchFilterTransform.fromString(filter || '');
  return aggregations
    .filter(aggregation => {
      return aggregation.results;
    })
    .map((aggregation: QueryTermAggregation) => {
      const aggregationField = get(aggregation, 'field', '');
      const aggregationResults: DiscoveryV1.AggregationResult[] = get(aggregation, 'results', []);
      const filterRefinementsForField = filterRefinements.find(
        aggregation => aggregation.field === aggregationField
      );

      if (!!filterRefinementsForField) {
        const filterRefinementResults = get(filterRefinementsForField, 'results', []);
        const newAggResults = aggregationResults.map((result: SelectableAggregationResult) => {
          const key = get(result, 'key', '');
          const filterRefinement = filterRefinementResults.find(
            (filterRefinement: SelectableAggregationResult) => {
              return filterRefinement.key === key;
            }
          );
          return filterRefinement ? Object.assign({}, result, { selected: true }) : result;
        });

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
          field: aggregationField,
          results: unionBy(unselectedNewAggResults, selectedNewAggAndFilterRefinementResults, 'key')
        };
      } else {
        return aggregation;
      }
    });
};
