import { QueryAggregationWithName } from './searchFacetInterfaces';

const TOP_ENTITIES_FIELD = 'enriched_text.entities.text';
const ENTITIES_NESTED_TYPE_TERM_AGG = '.term(enriched_text.entities.type,count:1)';

export const buildAggregationQuery = (configuration: QueryAggregationWithName[]): string => {
  const aggregation = configuration!.map(term => {
    const termCount = term.count ? ',count:' + term.count : '';
    const termName = term.name ? ',name:' + term.name : '';
    const topEntitiesNestedTypeTermAgg =
      term.field === TOP_ENTITIES_FIELD ? ENTITIES_NESTED_TYPE_TERM_AGG : '';
    return 'term(' + term.field + termCount + termName + ')' + topEntitiesNestedTypeTermAgg;
  });
  return '[' + aggregation.toString() + ']';
};
