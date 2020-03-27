import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { QueryTermAggregationWithName } from './searchFacetInterfaces';

const TOP_ENTITIES_FIELD = 'enriched_text.entities.text';
const ENTITIES_TYPE_NESTED_TERM = '.term(enriched_text.entities.type,count:1)';

export const buildAggregationQuery = (
  configuration?: QueryTermAggregationWithName[],
  searchParamsAgg?: DiscoveryV2.QueryParams['aggregation']
): string => {
  if (!searchParamsAgg) {
    const aggregation = configuration!.map(term => {
      const termCount = term.count ? ',count:' + term.count : '';
      const termName = term.name ? ',name:' + term.name : '';
      const topEntitiesType = term.field === TOP_ENTITIES_FIELD ? ENTITIES_TYPE_NESTED_TERM : '';
      return 'term(' + term.field + termCount + termName + ')' + topEntitiesType;
    });
    return '[' + aggregation!.toString() + ']';
  } else {
    if (searchParamsAgg.includes(TOP_ENTITIES_FIELD)) {
      const searchParamsAggArr = searchParamsAgg
        .replace('[', '')
        .replace(']', '')
        .split(',term');
      return (
        '[' +
        searchParamsAggArr
          .map(aggTerm => {
            if (aggTerm.includes(TOP_ENTITIES_FIELD)) {
              return (aggTerm += ENTITIES_TYPE_NESTED_TERM);
            }
            return aggTerm;
          })
          .join(',term') +
        ']'
      );
    } else {
      return searchParamsAgg;
    }
  }
};
