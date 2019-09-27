import DiscoveryV1 from 'ibm-watson/discovery/v1';

export const configurationToAggregation = (configuration: Array<DiscoveryV1.Term>) => {
  const aggregation = configuration.map(term => {
    return 'term(' + term.field + ',count:' + term.count + ')';
  });
  return '[' + aggregation.toString() + ']';
};
