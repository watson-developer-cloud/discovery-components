import DiscoveryV2, { QueryAggregation } from 'ibm-watson/discovery/v2';

function isBucketAggregation(
  aggregation: QueryAggregation
): aggregation is DiscoveryV2.QueryFilterAggregation | DiscoveryV2.QueryNestedAggregation {
  const { type } = aggregation;
  return type === 'filter' || type === 'nested';
}

export function findTermAggregations(
  inputAggregations: DiscoveryV2.QueryAggregation[] = [],
  outputAggregations: DiscoveryV2.QueryTermAggregation[] = []
): DiscoveryV2.QueryTermAggregation[] {
  inputAggregations.forEach((aggregation: DiscoveryV2.QueryAggregation) => {
    if (aggregation.type === 'term') {
      outputAggregations.push(aggregation as DiscoveryV2.QueryTermAggregation);
    } else if (isBucketAggregation(aggregation)) {
      outputAggregations.push(...findTermAggregations(aggregation.aggregations || []));
    }
  });

  return outputAggregations;
}
