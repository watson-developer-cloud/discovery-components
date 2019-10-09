import { buildAggregationQuery } from '../utils/buildAggregationQuery';
import { configurationOne, configurationTwo } from '../fixtures/configuration';

describe('BuildAggregationQuery', () => {
  test('it converts configuration with one term to expected aggregation parameter', () => {
    const aggParam = buildAggregationQuery(configurationOne);
    expect(aggParam).toEqual('[term(enriched_text.keywords,count:10)]');
  });

  test('it converts configuration with multiple terms to expected aggregation parameter', () => {
    const aggParam = buildAggregationQuery(configurationTwo);
    expect(aggParam).toEqual('[term(enriched_text.keywords,count:10),term(author,count:5)]');
  });
});
