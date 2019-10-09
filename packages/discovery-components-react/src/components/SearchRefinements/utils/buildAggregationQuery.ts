import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';

export const buildAggregationQuery = (configuration: Array<DiscoveryV1.Term>) => {
  const aggregation = configuration.map(term => {
    return 'term(' + term.field + ',count:' + term.count + ')';
  });
  return '[' + aggregation.toString() + ']';
};
