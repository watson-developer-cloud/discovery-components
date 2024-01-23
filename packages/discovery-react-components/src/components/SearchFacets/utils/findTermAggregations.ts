import {
  QueryAggregation,
  QueryAggregationQueryFilterAggregation,
  QueryAggregationQueryNestedAggregation,
  QueryAggregationQueryTermAggregation
} from 'ibm-watson/discovery/v2';

function isBucketAggregation(
  aggregation: QueryAggregation
): aggregation is QueryAggregationQueryFilterAggregation | QueryAggregationQueryNestedAggregation {
  const { type } = aggregation as QueryAggregationQueryFilterAggregation;
  return type === 'filter' || type === 'nested';
}

export function findTermAggregations(
  inputAggregations: QueryAggregation[] = [],
  outputAggregations: QueryAggregationQueryTermAggregation[] = []
): QueryAggregationQueryTermAggregation[] {
  inputAggregations.forEach(aggregation => {
    if ((aggregation as QueryAggregationQueryTermAggregation).type === 'term') {
      outputAggregations.push(aggregation as QueryAggregationQueryTermAggregation);
    } else if (isBucketAggregation(aggregation)) {
      outputAggregations.push(...findTermAggregations(aggregation.aggregations || []));
    }
  });

  return outputAggregations;
}
