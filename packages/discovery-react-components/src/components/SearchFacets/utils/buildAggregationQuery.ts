import { QueryAggregationWithName } from './searchFacetInterfaces';

export const buildAggregationQuery = (configuration: QueryAggregationWithName[]): string => {
  const aggregation = configuration.map(term => {
    if (term.type === 'term') {
      const termCount = term.count ? ',count:' + term.count : '';
      const termName = term.name ? ',name:' + term.name : '';
      let nestedTypeTermAgg = '';
      if (term.field.includes('enriched_') && term.field.includes('entities.text')) {
        const topLevelTermEntityField = term.field.split('.')[0];
        nestedTypeTermAgg = `.term(${topLevelTermEntityField}.entities.type,count:1)`;
      }
      return 'term(' + term.field + termCount + termName + ')' + nestedTypeTermAgg;
      // This supports nested dictionary aggregations
    } else {
      let nestedOrFilterAgg = '';
      if (term.aggregations && term.aggregations[0]) {
        const initialNested = 'nested(' + term.path ? term.path : term.aggregations[0].field;
        nestedOrFilterAgg = nestedOrFilterAgg + initialNested + ')';
        const matchAgg = term.match ? term.match : term.aggregations[0].match;
        nestedOrFilterAgg = nestedOrFilterAgg + '.filter(' + matchAgg + ')';
        let termAggregation;
        if (term.aggregations[0].aggregations) {
          termAggregation = term.aggregations[0].aggregations[0];
        } else {
          termAggregation = term.aggregations[0];
        }
        nestedOrFilterAgg += '.term(' + termAggregation.field;
        const termCount = termAggregation.count ? ',count:' + termAggregation.count : '';
        const termName = termAggregation.name ? ',name:' + termAggregation.name : '';
        nestedOrFilterAgg = nestedOrFilterAgg + termCount + termName + ')';
      }
      return nestedOrFilterAgg;
    }
  });
  return '[' + aggregation.toString() + ']';
};
