import { buildAggregationQuery } from '../buildAggregationQuery';
import {
  configurationWithOneField,
  configurationWithTwoFields,
  configurationWithoutCounts,
  configurationWithTopEntities,
  configurationWithFilterQueryAggregation,
  configurationWithNestedQueryAggregation
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
      '[nested(enriched_text.entities).term(enriched_text.entities.text,count:12,name:entities).term(enriched_text.entities.type,count:1),term(author)]'
    );
  });

  test('it converts configuration with nested query aggregation to expected aggregation parameter', () => {
    const aggParam = buildAggregationQuery(configurationWithNestedQueryAggregation);
    expect(aggParam).toEqual(
      '[nested(enriched_text.entities).term(enriched_text.entities.text,count:12,name:entities).term(enriched_text.entities.type,count:1),term(author),nested(enriched_text.entities).filter(enriched_text.entities.model_name:"Dictionary:.products").term(enriched_text.entities.text,count:4,name:dict_ypKBKYnM8LOq)]'
    );
  });

  test('it converts configuration with filter query aggregation to expected aggregation parameter', () => {
    const aggParam = buildAggregationQuery(configurationWithFilterQueryAggregation);
    expect(aggParam).toEqual(
      '[nested(enriched_text.entities).term(enriched_text.entities.text,count:12,name:entities).term(enriched_text.entities.type,count:1),term(author),nested(enriched_text.entities.enriched_text.entities.text).filter(enriched_text.entities.enriched_text.entities.model_name:"Dictionary:.test").term(enriched_text.entities.enriched_text.entities.text,count:4,name:dict_yqYQPpM8OljE)]'
    );
  });
});
