import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { findTermAggregations } from '../findTermAggregations';
import {
  twoTermAggs,
  nestedTermAgg,
  nestedFilterTermAgg,
  twoNestedFilterTermAgg
} from 'components/SearchFacets/__fixtures__/aggregationResponses';

describe('findTermAggregations', () => {
  test('keeps two term aggregations the same', () => {
    const termAggregations: DiscoveryV2.QueryTermAggregation[] = findTermAggregations(
      twoTermAggs.aggregations
    );
    expect(termAggregations).toEqual([
      {
        type: 'term',
        field: 'author',
        count: 3,
        results: [
          {
            key: 'ABMN Staff',
            matching_results: 138993
          },
          {
            key: 'News Staff',
            matching_results: 57158
          },
          {
            key: 'editor',
            matching_results: 32444
          }
        ]
      },
      {
        type: 'term',
        field: 'subject',
        count: 4,
        results: [
          {
            key: 'Animals',
            matching_results: 138993
          },
          {
            key: 'People',
            matching_results: 133760
          },
          {
            key: 'Places',
            matching_results: 129139
          },
          {
            key: 'Things',
            matching_results: 76403
          }
        ]
      }
    ]);
  });

  test('removes a top level nested aggregation to retrieve second level term aggregation', () => {
    const termAggregations: DiscoveryV2.QueryTermAggregation[] = findTermAggregations(
      nestedTermAgg.aggregations
    );
    expect(termAggregations).toEqual([
      {
        type: 'term',
        field: 'enriched_text.entities.text',
        results: [
          {
            key: 'United States',
            matching_results: 863358
          },
          {
            key: 'Twitter',
            matching_results: 825192
          }
        ]
      }
    ]);
  });

  test('removes a top level nested aggregation and second level filter aggregation to retrieve third level term aggrgation', () => {
    const termAggregations: DiscoveryV2.QueryTermAggregation[] = findTermAggregations(
      nestedFilterTermAgg.aggregations
    );
    expect(termAggregations).toEqual([
      {
        type: 'term',
        field: 'enriched_text.entities.text',
        results: [
          {
            key: 'Twitter',
            matching_results: 825192
          },
          {
            key: 'Facebook',
            matching_results: 793668
          }
        ]
      }
    ]);
  });

  test('removes 2 top level nested aggregation and second level filter aggregation to retrieve both third level term aggrgations', () => {
    const termAggregations: DiscoveryV2.QueryTermAggregation[] = findTermAggregations(
      twoNestedFilterTermAgg.aggregations
    );
    expect(termAggregations).toEqual([
      {
        type: 'term',
        field: 'enriched_text.entities.text',
        results: [
          {
            key: 'Twitter',
            matching_results: 825192
          },
          {
            key: 'Facebook',
            matching_results: 793668
          }
        ]
      },
      {
        type: 'term',
        field: 'enriched_text.entities.text',
        results: [
          {
            key: 'Twitter',
            matching_results: 825192
          },
          {
            key: 'Facebook',
            matching_results: 793668
          }
        ]
      }
    ]);
  });
});
