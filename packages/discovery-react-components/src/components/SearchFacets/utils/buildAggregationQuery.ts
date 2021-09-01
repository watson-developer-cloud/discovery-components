import { escapeFieldName } from './escapeFieldName';
import { QueryAggregationWithName } from './searchFacetInterfaces';

export const buildAggregationQuery = (configuration: QueryAggregationWithName[]): string => {
  const aggregation = configuration.map(
    ({ type, count, name, field, aggregations, match, path }) => {
      if (type === 'term' && field) {
        const escapedFieldName = escapeFieldName(field);
        const termCount = count ? ',count:' + count : '';
        const termName = name ? ',name:' + name : '';
        let nestedTypeTermAgg = '';

        let query = `term(${escapedFieldName}${termCount}${termName})${nestedTypeTermAgg}`;

        if (field.includes('enriched_') && field.includes('entities.text')) {
          const topLevelTermEntityField = field.split('.')[0];
          const topLevelNestedField = field.slice(0, field.lastIndexOf('.'));
          nestedTypeTermAgg = `.term(${topLevelTermEntityField}.entities.type,count:1)`;
          query = `nested(${topLevelNestedField}).${query}`;
        }

        return query;
      }

      // This supports nested and filter aggregations, including dictionary aggregations
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
  );

  return '[' + aggregation.toString() + ']';
};
