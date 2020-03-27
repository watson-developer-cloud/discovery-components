import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { QueryAggregationWithName } from './searchFacetInterfaces';

const TOP_ENTITIES_FIELD = 'enriched_text.entities.text';
const ENTITIES_NESTED_TYPE_TERM_AGG = '.term(enriched_text.entities.type,count:1)';

export const buildAggregationQuery = (
  configuration?: QueryAggregationWithName[],
  searchParamsAgg?: DiscoveryV2.QueryParams['aggregation']
): string => {
  if (!searchParamsAgg) {
    const aggregation = configuration!.map(term => {
      const termCount = term.count ? ',count:' + term.count : '';
      const termName = term.name ? ',name:' + term.name : '';
      const topEntitiesNestedTypeTermAgg =
        term.field === TOP_ENTITIES_FIELD ? ENTITIES_NESTED_TYPE_TERM_AGG : '';
      return 'term(' + term.field + termCount + termName + ')' + topEntitiesNestedTypeTermAgg;
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
          .map(termAgg => {
            if (termAgg.includes(TOP_ENTITIES_FIELD)) {
              return (termAgg += ENTITIES_NESTED_TYPE_TERM_AGG);
            }
            return termAgg;
          })
          .join(',term') +
        ']'
      );
    } else {
      return searchParamsAgg;
    }
  }
};
