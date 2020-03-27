import DiscoveryV2 from 'ibm-watson/discovery/v2';

export interface QueryAggregationResults extends DiscoveryV2.QueryAggregation {
  field?: string;
  count?: number;
  name?: string;
}

export const buildAggregationQuery = (
  configuration: QueryAggregationResults[],
  searchParamsAgg?: DiscoveryV2.QueryParams['aggregation']
): string => {
  if (!searchParamsAgg) {
    // TODO: Also need to add in term.name if it's already included - also need just the check for name and not count
    const aggregation = configuration.map(term => {
      if (term.field === 'enriched_text.entities.text') {
        if (term.count && term.name) {
          return (
            'term(' +
            term.field +
            ',count:' +
            term.count +
            ',name:' +
            term.name +
            ')' +
            '.term(enriched_text.entities.type,count:1)'
          );
        }
        return term.count
          ? 'term(' +
              term.field +
              ',count:' +
              term.count +
              ')' +
              '.term(enriched_text.entities.type,count:1)'
          : 'term(' + term.field + ')' + '.term(enriched_text.entities.type';
      }
      if (term.count && term.name) {
        return 'term(' + term.field + ',count:' + term.count + ',name:' + term.name + ')';
      }
      return term.count
        ? 'term(' + term.field + ',count:' + term.count + ')'
        : 'term(' + term.field + ')';
    });
    return '[' + aggregation.toString() + ']';
  } else {
    if (searchParamsAgg.includes('enriched_text.entities.text')) {
      const replacedSearchParamsAgg = searchParamsAgg.replace('[', '').replace(']', '');
      const searchParamsAggArr = replacedSearchParamsAgg.split('term');
      if (searchParamsAggArr.indexOf('') > -1) {
        searchParamsAggArr.splice(searchParamsAggArr.indexOf(''), 1);
      }
      return (
        '[' +
        searchParamsAggArr
          .map(agg => {
            const aggArr = agg.split(',');
            if (aggArr.indexOf('') > -1) {
              aggArr.splice(aggArr.indexOf(''), 1);
            }
            if (aggArr[0].includes('enriched_text.entities.text')) {
              aggArr[0] = 'term' + aggArr[0];
              aggArr[aggArr.length - 1] += '.term(enriched_text.entities.type,count:1)';
            }
            return aggArr.join(',');
          })
          .join(',term') +
        ']'
      );
    } else {
      return searchParamsAgg;
    }
  }
};
