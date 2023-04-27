import { InternalQueryTermAggregation } from './searchFacetInterfaces';

export function fieldHasCategories(
  aggregation: Pick<InternalQueryTermAggregation, 'results' | 'field'>
) {
  return (
    aggregation.field.includes('enriched_') &&
    aggregation.field.includes('entities.text') &&
    aggregation.results?.[0]?.aggregations !== undefined
  );
}
