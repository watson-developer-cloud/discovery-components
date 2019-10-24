import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import { QueryTermAggregation } from './searchRefinementInterfaces';

export function findTermAggregations(
  inputAggregations: DiscoveryV1.QueryAggregation[] = [],
  outputAggregations: QueryTermAggregation[] = []
): QueryTermAggregation[] {
  inputAggregations.forEach((aggregation: DiscoveryV1.QueryAggregation) => {
    if (aggregation.type === 'term') {
      outputAggregations.push(aggregation);
    } else {
      outputAggregations.push(...findTermAggregations(aggregation.aggregations || []));
    }
  });

  return outputAggregations;
}
