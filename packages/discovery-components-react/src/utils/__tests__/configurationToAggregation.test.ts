import { configurationToAggregation } from '../configurationToAggregation';
import { configurationOne, configurationTwo } from '../fixtures/configuration';

describe('ConfigurationToAggregation', () => {
  test('it converts configuration with one term to expected aggregation parameter', () => {
    const aggParam = configurationToAggregation(configurationOne);
    expect(aggParam).toEqual('[term(enriched_text.keywords,count:10)]');
  });

  test('it converts configuration with multiple terms to expected aggregation parameter', () => {
    const aggParam = configurationToAggregation(configurationTwo);
    expect(aggParam).toEqual('[term(enriched_text.keywords,count:10),term(author,count:5)]');
  });
});
