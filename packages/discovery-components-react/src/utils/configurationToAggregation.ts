import DiscoveryV1 from 'ibm-watson/discovery/v1';

/** TODO: This will be used in the DiscoverySearch component to take in the refinements configuration
 * and translate that to an aggregation for the search parameters, to be used for the SearchRefinements component.
 */
export const configurationToAggregation = (configuration: Array<DiscoveryV1.Term>) => {
  const aggregation = configuration.map(term => {
    return 'term(' + term.field + ',count:' + term.count + ')';
  });
  return '[' + aggregation.toString() + ']';
};
