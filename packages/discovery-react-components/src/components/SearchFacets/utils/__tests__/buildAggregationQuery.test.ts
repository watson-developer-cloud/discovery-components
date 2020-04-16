import { buildAggregationQuery } from '../buildAggregationQuery';
import {
  configurationWithOneField,
  configurationWithTwoFields,
  configurationWithoutCounts,
  configurationWithTopEntities
} from 'components/SearchFacets/__fixtures__/configuration';

describe('BuildAggregationQuery', () => {
  test('it converts configuration with one term to expected aggregation parameter', () => {
    const aggParam = buildAggregationQuery(configurationWithOneField);
    expect(aggParam).toEqual('[term(enriched_text.keywords,count:10)]');
  });

  test('it converts configuration with multiple terms to expected aggregation parameter', () => {
    const aggParam = buildAggregationQuery(configurationWithTwoFields);
    expect(aggParam).toEqual('[term(enriched_text.keywords,count:10),term(author,count:5)]');
  });

  test('it constructs an aggregation query without a count if count is not provided in configuration', () => {
    const aggParam = buildAggregationQuery(configurationWithoutCounts);
    expect(aggParam).toEqual('[term(enriched_text.keywords),term(author)]');
  });

  test('it converts configuration with multiple terms, count, and name, including Top Entities, to expected aggregation parameter', () => {
    const aggParam = buildAggregationQuery(configurationWithTopEntities);
    expect(aggParam).toEqual(
      '[term(enriched_text.entities.text,count:12,name:entities).term(enriched_text.entities.type,count:1),term(author)]'
    );
  });
});
