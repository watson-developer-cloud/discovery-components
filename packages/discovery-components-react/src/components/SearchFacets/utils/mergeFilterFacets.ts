import {
  InternalQueryTermAggregation,
  SelectableQueryTermAggregationResult
} from './searchFacetInterfaces';
import { findTermAggregations } from './findTermAggregations';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import get from 'lodash/get';
import unionBy from 'lodash/unionBy';

export const mergeFilterFacets = (
  aggregations: DiscoveryV2.QueryAggregation[],
  filterFields: InternalQueryTermAggregation[],
  componentSettingsAggregations: DiscoveryV2.ComponentSettingsAggregation[]
): InternalQueryTermAggregation[] => {
  if (!aggregations) {
    return [];
  }

  const termAggreations = findTermAggregations(aggregations);
  // add component settings label if it exist's
  const labeledTermAggregtions: InternalQueryTermAggregation[] = termAggreations.map(
    (termAggregation, i) => {
      if (componentSettingsAggregations[i]) {
        return {
          ...termAggregation,
          label: componentSettingsAggregations[i].label,
          multiple_selections_allowed: componentSettingsAggregations[i].multiple_selections_allowed,
          field: termAggregation.field
        };
      } else {
        return { ...termAggregation, ...{ multiple_selections_allowed: true } };
      }
    }
  );

  return labeledTermAggregtions
    .filter(aggregation => {
      return aggregation.results;
    })
    .map((aggregation: InternalQueryTermAggregation) => {
      const aggregationField = get(aggregation, 'field', '');
      const aggregationResults: SelectableQueryTermAggregationResult[] = get(
        aggregation,
        'results',
        []
      );
      const filterFacetsForField = filterFields.find(
        aggregation => aggregation.field === aggregationField
      );

      if (!!filterFacetsForField) {
        const filterFacetResults: SelectableQueryTermAggregationResult[] = get(
          filterFacetsForField,
          'results',
          []
        );
        const newAggResults: SelectableQueryTermAggregationResult[] = aggregationResults.map(
          (result: SelectableQueryTermAggregationResult) => {
            const key = get(result, 'key', '');
            const filterFacet = filterFacetResults.find(
              (filterFacet: SelectableQueryTermAggregationResult) => {
                return filterFacet.key === key;
              }
            );
            return filterFacet ? Object.assign({}, result, { selected: true }) : result;
          }
        );

        const selectedNewAggResults = newAggResults.filter(result => result.selected);
        const selectedNewAggAndFilterFacetResults = unionBy(
          selectedNewAggResults,
          filterFacetResults,
          'key'
        );

        const unselectedResultsToSlice =
          get(aggregation, 'count', 10) - selectedNewAggAndFilterFacetResults.length;
        const unselectedNewAggResults = newAggResults
          .filter(result => !result.selected)
          .slice(0, unselectedResultsToSlice);

        return {
          type: 'term',
          field: aggregationField,
          label: aggregation.label,
          multiple_selections_allowed: aggregation.multiple_selections_allowed,
          results: unionBy(unselectedNewAggResults, selectedNewAggAndFilterFacetResults, 'key')
        };
      } else {
        return aggregation;
      }
    });
};
