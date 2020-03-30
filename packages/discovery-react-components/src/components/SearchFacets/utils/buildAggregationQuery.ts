import { QueryAggregationWithName } from './searchFacetInterfaces';

export const buildAggregationQuery = (configuration: QueryAggregationWithName[]): string => {
  const aggregation = configuration!.map(term => {
    const termCount = term.count ? ',count:' + term.count : '';
    const termName = term.name ? ',name:' + term.name : '';
    let nestedTypeTermAgg = '';
    if (term.field!.includes('enriched_')) {
      const topLevelTermEntityField = term.field!.split('.')[0];
      nestedTypeTermAgg = `.term(${topLevelTermEntityField}.entities.type,count:1)`;
    }
    return 'term(' + term.field + termCount + termName + ')' + nestedTypeTermAgg;
  });
  return '[' + aggregation.toString() + ']';
};
