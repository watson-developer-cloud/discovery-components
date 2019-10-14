import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';

export const buildAggregationQuery = (configuration: DiscoveryV1.Term[]) => {
  const aggregation = configuration.map(term => {
    return term.count
      ? 'term(' + term.field + ',count:' + term.count + ')'
      : 'term(' + term.field + ')';
  });
  return '[' + aggregation.toString() + ']';
};
