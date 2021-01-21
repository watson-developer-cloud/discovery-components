import {
  InternalQueryTermAggregation,
  SelectableQueryTermAggregationResult
} from './searchFacetInterfaces';
import { findTermAggregations } from './findTermAggregations';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import get from 'lodash/get';
import unionBy from 'lodash/unionBy';

export const mergeFilterFacets = (
  aggregations: DiscoveryV2.QueryAggregation[] | null,
  filterFields: InternalQueryTermAggregation[],
  componentSettingsAggregations: DiscoveryV2.ComponentSettingsAggregation[]
): InternalQueryTermAggregation[] => {
  if (!aggregations) {
    return [];
  }

  const termAggregations = findTermAggregations(aggregations);
  // add component settings label if it exists
  const labeledTermAggregations: InternalQueryTermAggregation[] = termAggregations.map(
    termAggregation => {
      const matchingComponentSettingAggregation = componentSettingsAggregations.find(
        setting => setting.name === get(termAggregation, 'name', '')
      );
      if (matchingComponentSettingAggregation) {
        return {
          ...termAggregation,
          ...matchingComponentSettingAggregation
        };
      } else {
        return { ...termAggregation, multiple_selections_allowed: true };
      }
    }
  );

  const usedFields: string[] = [];
  return labeledTermAggregations
    .filter(aggregation => {
      return aggregation.results;
    })
    .map((aggregation: InternalQueryTermAggregation) => {
      const aggregationResults: SelectableQueryTermAggregationResult[] = get(
        aggregation,
        'results',
        []
      );
      const filterFacetsForName = filterFields.find(filterAggregation => {
        if (!filterAggregation.name || !aggregation.name) {
          // aggregation is from initial filter string, we can only match on field
          if (
            filterAggregation.field === aggregation.field &&
            !usedFields.includes(filterAggregation.field)
          ) {
            usedFields.push(filterAggregation.field);
            return true;
          }
          return false;
        }
        return filterAggregation.name === aggregation.name;
      });

      if (!!filterFacetsForName) {
        const filterFacetResults: SelectableQueryTermAggregationResult[] = get(
          filterFacetsForName,
          'results',
          []
        );
        const newAggResults: SelectableQueryTermAggregationResult[] = aggregationResults.map(
          (result: SelectableQueryTermAggregationResult) => {
            const key = get(result, 'key', '');
            const matchingFilterFacetResult = filterFacetResults.find(
              (filterFacet: SelectableQueryTermAggregationResult) => {
                return filterFacet.key === key;
              }
            );
            if (matchingFilterFacetResult && matchingFilterFacetResult.selected) {
              return { ...result, selected: true };
            }
            return result;
          }
        );
        const selectedNewAggAndFilterFacetResults = unionBy(
          newAggResults,
          filterFacetResults,
          'key'
        );

        return {
          ...aggregation,
          results: selectedNewAggAndFilterFacetResults
        };
      } else {
        return aggregation;
      }
    });
};
