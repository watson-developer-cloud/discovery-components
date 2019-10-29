import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';
import { QueryTermAggregation } from './searchRefinementInterfaces';

export function findTermAggregations(
  inputAggregations: DiscoveryV2.QueryAggregation[] = [],
  outputAggregations: QueryTermAggregation[] = []
): QueryTermAggregation[] {
  inputAggregations.forEach((aggregation: DiscoveryV2.QueryAggregation) => {
    if (aggregation.type === 'term') {
      outputAggregations.push(aggregation);
    } else {
      outputAggregations.push(...findTermAggregations(aggregation.aggregations || []));
    }
  });

  return outputAggregations;
}
