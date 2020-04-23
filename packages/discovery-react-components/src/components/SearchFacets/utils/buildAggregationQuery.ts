import { QueryAggregationWithName } from './searchFacetInterfaces';

export const buildAggregationQuery = (configuration: QueryAggregationWithName[]): string => {
  const aggregation = configuration.map(
    ({ type, count, name, field, aggregations, match, path }) => {
      if (type === 'term' && field) {
        const termCount = count ? ',count:' + count : '';
        const termName = name ? ',name:' + name : '';
        let nestedTypeTermAgg = '';
        if (field.includes('enriched_') && field.includes('entities.text')) {
          const topLevelTermEntityField = field.split('.')[0];
          nestedTypeTermAgg = `.term(${topLevelTermEntityField}.entities.type,count:1)`;
        }
        return 'term(' + field + termCount + termName + ')' + nestedTypeTermAgg;
        // This supports nested and filter aggregations, including dictionary aggregations
      } else {
        let nestedOrFilterAgg = '';
        if (aggregations && aggregations[0]) {
          nestedOrFilterAgg += 'nested(';
          const initialNested = path ? path : aggregations[0].field;
          const matchAgg = match ? match : aggregations[0].match;
          nestedOrFilterAgg = nestedOrFilterAgg + initialNested + ').filter(' + matchAgg + ')';
          let termAggregation;
          if (aggregations[0].aggregations) {
            termAggregation = aggregations[0].aggregations[0];
          } else {
            termAggregation = aggregations[0];
          }
          const termCount = termAggregation.count ? ',count:' + termAggregation.count : '';
          const termName = termAggregation.name ? ',name:' + termAggregation.name : '';
          nestedOrFilterAgg =
            nestedOrFilterAgg + '.term(' + termAggregation.field + termCount + termName + ')';
        }
        return nestedOrFilterAgg;
      }
    }
  );
  return '[' + aggregation.toString() + ']';
};
