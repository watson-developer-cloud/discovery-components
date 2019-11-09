import * as React from 'react';
import { render, RenderResult, fireEvent } from '@testing-library/react';
import { QueryTermAggregation } from '@disco-widgets/ibm-watson/discovery/v2';
import { wrapWithContext } from '../../../utils/testingUtils';
import { SearchFacets } from '../SearchFacets';
import {
  SearchContextIFC,
  SearchApiIFC,
  searchResponseStoreDefaults
} from '../../DiscoverySearch/DiscoverySearch';
import { facetsQueryResponse } from '../__fixtures__/facetsQueryResponse';
import collectionsResponse from '../__fixtures__/collectionsResponse';
import { noAvailableFacetsMessage } from '../utils/searchFacetMessages';
import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';
import '@testing-library/jest-dom/extend-expect';

interface Setup {
  context: Partial<SearchContextIFC>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchAggregationsMock: jest.Mock<any, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  performSearchMock: jest.Mock<any, any>;
  searchFacetsComponent: RenderResult;
}

const setup = (
  filter: string,
  showCollections = false,
  aggregations = facetsQueryResponse.result.aggregations,
  componentSettingsAggregations?: DiscoveryV2.ComponentSettingsAggregation[]
): Setup => {
  const fetchAggregationsMock = jest.fn();
  const performSearchMock = jest.fn();
  const context: Partial<SearchContextIFC> = {
    aggregationResults: aggregations,
    collectionsResults: collectionsResponse.result,
    searchResponseStore: {
      ...searchResponseStoreDefaults,
      parameters: {
        projectId: '',
        filter,
        aggregation: '[term(author,count:3),term(subject,count:4)]'
      }
    },
    componentSettings: {
      aggregations: componentSettingsAggregations
    }
  };
  const api: Partial<SearchApiIFC> = {
    performSearch: performSearchMock,
    fetchAggregations: fetchAggregationsMock
  };
  const searchFacetsComponent = render(
    wrapWithContext(<SearchFacets showCollections={showCollections} />, api, context)
  );
  return {
    context,
    performSearchMock,
    fetchAggregationsMock,
    searchFacetsComponent: searchFacetsComponent
  };
};

describe('SearchFacetsComponent', () => {
  describe('component load', () => {
    test('it calls fetch aggregations with aggregation string', () => {
      const { fetchAggregationsMock } = setup('');
      expect(fetchAggregationsMock).toBeCalledTimes(1);
      expect(fetchAggregationsMock).toBeCalledWith(
        expect.objectContaining({
          aggregation: '[term(author,count:3),term(subject,count:4)]'
        })
      );
    });
  });

  describe('field facets', () => {
    describe('when aggregations exist', () => {
      describe('legend header elements', () => {
        describe('When there are no aggregation component settings', () => {
          test('contains first facet header with category field text', () => {
            const { searchFacetsComponent } = setup('');
            const headerCategoryField = searchFacetsComponent.getByText('category');
            expect(headerCategoryField).toBeDefined();
          });

          test('contains second facet header with machine_learning_terms field text', () => {
            const { searchFacetsComponent } = setup('');
            const headerMachineLearningTermsField = searchFacetsComponent.getByText(
              'machine_learning_terms'
            );
            expect(headerMachineLearningTermsField).toBeDefined();
          });
        });

        describe('When there are aggregation component settings', () => {
          test('should render the labels contained in aggregation component settings', () => {
            const { searchFacetsComponent } = setup('', undefined, undefined, [
              { label: 'label1' },
              { label: 'label2' }
            ]);
            expect(searchFacetsComponent.getByText('label1')).toBeInTheDocument();
            expect(searchFacetsComponent.getByText('label2')).toBeInTheDocument();
          });

          describe('And there is a filter string also', () => {
            test('should render the labels contained in aggregation component settings', () => {
              const { searchFacetsComponent } = setup('author:"editor"', undefined, undefined, [
                { label: 'label1' },
                { label: 'label2' }
              ]);
              expect(searchFacetsComponent.getByText('label1')).toBeInTheDocument();
              expect(searchFacetsComponent.getByText('label2')).toBeInTheDocument();
            });
          });
        });
      });
    });

    describe('when no aggregations exist', () => {
      test('shows empty aggregations message', () => {
        const { searchFacetsComponent } = setup('', false, []);
        const emptyMessage = searchFacetsComponent.getByText(noAvailableFacetsMessage);
        expect(emptyMessage).toBeDefined();
      });
    });
  });

  describe('collection facet', () => {
    describe('when collections exists', () => {
      test('can be shown', () => {
        const { searchFacetsComponent } = setup('subject:Animals', true);
        const collectionSelect = searchFacetsComponent.getByText('Available collections');
        expect(collectionSelect).toBeDefined();
      });

      test('can be hidden', () => {
        const { searchFacetsComponent } = setup('subject:Animals');
        const collectionSelect = searchFacetsComponent.queryByText('Available collections');
        expect(collectionSelect).toBeNull();
      });
    });

    describe('when no collections exits', () => {
      test('is not shown', () => {
        const { searchFacetsComponent } = setup('subject:Animals');
        const collectionSelect = searchFacetsComponent.queryByText('Available collections');
        expect(collectionSelect).toBeNull();
      });
    });
  });

  describe('root clear all button', () => {
    let setupData: Setup;
    describe('when no filters are present', () => {
      beforeEach(() => {
        setupData = setup('');
      });

      test('does not show the root clear all button', () => {
        const { searchFacetsComponent } = setupData;
        expect(searchFacetsComponent.queryAllByText('Clear all')).toHaveLength(0);
      });
    });

    describe('when there are filters present', () => {
      beforeEach(() => {
        setupData = setup('subject:Animals');
      });

      test('does show the root clear all button', () => {
        const { searchFacetsComponent } = setupData;
        expect(searchFacetsComponent.queryAllByText('Clear all')).toHaveLength(1);
      });

      describe('and the clear all button is clicked', () => {
        beforeEach(() => {
          const { searchFacetsComponent } = setupData;
          fireEvent.click(searchFacetsComponent.getByText('Clear all'));
        });

        test('resets all the filters', () => {
          const { performSearchMock } = setupData;
          expect(performSearchMock).toHaveBeenCalledWith(
            expect.objectContaining({
              filter: '',
              collectionIds: [],
              offset: 0
            }),
            false
          );
        });
      });
    });
  });

  describe('i18n messages', () => {
    let result: RenderResult;
    const termAgg: QueryTermAggregation = {
      type: 'term',
      field: 'one',
      results: [
        {
          key: 'two',
          matching_results: 1
        }
      ]
    };
    describe('when no messages are provided', () => {
      beforeEach(() => {
        result = render(
          wrapWithContext(
            <SearchFacets />,
            {},
            {
              aggregationResults: [termAgg],
              searchResponseStore: {
                ...searchResponseStoreDefaults,
                parameters: {
                  projectId: '',
                  filter: 'one:"two"'
                }
              }
            }
          )
        );
      });

      test('uses default messages', () => {
        expect(result.queryAllByText('Clear all')).toHaveLength(1);
        expect(result.queryAllByTitle('Clear all selected items')).toHaveLength(1);
      });
    });

    describe('when a message is overridden', () => {
      beforeEach(() => {
        result = render(
          wrapWithContext(
            <SearchFacets messages={{ clearAllButtonText: 'different text' }} />,
            {},
            {
              aggregationResults: [termAgg],
              searchResponseStore: {
                ...searchResponseStoreDefaults,
                parameters: {
                  projectId: '',
                  filter: 'one:"two"'
                }
              }
            }
          )
        );
      });

      test('only overrides provided messages and uses defaults for the rest', () => {
        expect(result.queryAllByText('different text')).toHaveLength(1);
        expect(result.queryAllByTitle('Clear all selected items')).toHaveLength(1);
      });
    });
  });
});
