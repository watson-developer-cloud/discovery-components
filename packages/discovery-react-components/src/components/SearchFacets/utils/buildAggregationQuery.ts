import DiscoveryV2 from 'ibm-watson/discovery/v2';

export interface QueryAggregationResults extends DiscoveryV2.QueryAggregation {
  field?: string;
  count?: number;
  name?: string;
}

export const buildAggregationQuery = (
  configuration?: QueryAggregationResults[],
  searchParamsAgg?: DiscoveryV2.QueryParams['aggregation']
): string => {
  if (!searchParamsAgg) {
    const aggregation = configuration!.map(term => {
      const termCount = term.count ? ',count:' + term.count : '';
      const termName = term.name ? ',name:' + term.name : '';
      const topEntitiesType =
        term.field === 'enriched_text.entities.text'
          ? '.term(enriched_text.entities.type,count:1)'
          : '';
      return 'term(' + term.field + termCount + termName + ')' + topEntitiesType;
    });
    return '[' + aggregation!.toString() + ']';
  } else {
    if (searchParamsAgg.includes('enriched_text.entities.text')) {
      const searchParamsAggArr = searchParamsAgg
        .replace('[', '')
        .replace(']', '')
        .split(',term');
      return (
        '[' +
        searchParamsAggArr
          .map(agg => {
            if (agg.includes('enriched_text.entities.text')) {
              return (agg += '.term(enriched_text.entities.type,count:1)');
            }
            return agg;
          })
          .join(',term') +
        ']'
      );
    } else {
      return searchParamsAgg;
    }
  }
};
