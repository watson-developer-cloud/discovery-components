import * as React from 'react';
import { render, RenderResult, fireEvent } from '@testing-library/react';
import { QueryTermAggregation } from '@disco-widgets/ibm-watson/discovery/v2';
import { wrapWithContext } from '../../../utils/testingUtils';
import { SearchRefinements } from '../SearchRefinements';
import { SearchContextIFC, SearchApiIFC } from '../../DiscoverySearch/DiscoverySearch';
import { refinementsQueryResponse } from '../__fixtures__/refinementsQueryResponse';
import collectionsResponse from '../__fixtures__/collectionsResponse';
import { noAvailableRefinementsMessage } from '../utils/searchRefinementMessages';
import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';
import '@testing-library/jest-dom/extend-expect';

interface Setup {
  context: Partial<SearchContextIFC>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchAggregationsMock: jest.Mock<any, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  performSearchMock: jest.Mock<any, any>;
  searchRefinementsComponent: RenderResult;
}

const setup = (
  filter: string,
  showCollections = false,
  aggregations = refinementsQueryResponse.result.aggregations,
  componentSettingsAggregations?: DiscoveryV2.ComponentSettingsAggregation[]
): Setup => {
  const fetchAggregationsMock = jest.fn();
  const performSearchMock = jest.fn();
  const context: Partial<SearchContextIFC> = {
    aggregationResults: aggregations,
    collectionsResults: collectionsResponse.result,
    searchParameters: {
      projectId: '',
      filter: filter,
      aggregation: '[term(author,count:3),term(subject,count:4)]'
    },
    componentSettings: {
      aggregations: componentSettingsAggregations
    }
  };
  const api: Partial<SearchApiIFC> = {
    performSearch: performSearchMock,
    fetchAggregations: fetchAggregationsMock
  };
  const searchRefinementsComponent = render(
    wrapWithContext(<SearchRefinements showCollections={showCollections} />, api, context)
  );
  return {
    context,
    performSearchMock,
    fetchAggregationsMock,
    searchRefinementsComponent
  };
};

describe('SearchRefinementsComponent', () => {
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

  describe('field refinements', () => {
    describe('when aggregations exist', () => {
      describe('legend header elements', () => {
        describe('When there are no aggregation component settings', () => {
          test('contains first refinement header with author field text', () => {
            const { searchRefinementsComponent } = setup('');
            const headerAuthorField = searchRefinementsComponent.getByText('author');
            expect(headerAuthorField).toBeDefined();
          });

          test('contains second refinement header with subject field text', () => {
            const { searchRefinementsComponent } = setup('');
            const headerSubjectField = searchRefinementsComponent.getByText('subject');
            expect(headerSubjectField).toBeDefined();
          });
        });

        describe('When there are aggregation component settings', () => {
          test('should render the labels contained in aggregation component settings', () => {
            const { searchRefinementsComponent } = setup('', undefined, undefined, [
              { label: 'label1' },
              { label: 'label2' }
            ]);
            expect(searchRefinementsComponent.getByText('label1')).toBeInTheDocument();
            expect(searchRefinementsComponent.getByText('label2')).toBeInTheDocument();
          });

          describe('And there is a filter string also', () => {
            test('should render the labels contained in aggregation component settings', () => {
              const { searchRefinementsComponent } = setup(
                'author:"editor"',
                undefined,
                undefined,
                [{ label: 'label1' }, { label: 'label2' }]
              );
              expect(searchRefinementsComponent.getByText('label1')).toBeInTheDocument();
              expect(searchRefinementsComponent.getByText('label2')).toBeInTheDocument();
            });
          });
        });
      });
    });

    describe('when no aggregations exist', () => {
      test('shows empty aggregations message', () => {
        const { searchRefinementsComponent } = setup('', false, []);
        const emptyMessage = searchRefinementsComponent.getByText(noAvailableRefinementsMessage);
        expect(emptyMessage).toBeDefined();
      });
    });
  });

  describe('collection refinements', () => {
    describe('when collections exists', () => {
      test('can be shown', () => {
        const { searchRefinementsComponent } = setup('subject:Animals', true);
        const collectionSelect = searchRefinementsComponent.getByText('Available collections');
        expect(collectionSelect).toBeDefined();
      });

      test('can be hidden', () => {
        const { searchRefinementsComponent } = setup('subject:Animals');
        const collectionSelect = searchRefinementsComponent.queryByText('Available collections');
        expect(collectionSelect).toBeNull();
      });
    });

    describe('when no collections exits', () => {
      test('is not shown', () => {
        const { searchRefinementsComponent } = setup('subject:Animals');
        const collectionSelect = searchRefinementsComponent.queryByText('Available collections');
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
        const { searchRefinementsComponent } = setupData;
        expect(searchRefinementsComponent.queryAllByText('Clear all')).toHaveLength(0);
      });
    });

    describe('when there are filters present', () => {
      beforeEach(() => {
        setupData = setup('subject:Animals');
      });

      test('does show the root clear all button', () => {
        const { searchRefinementsComponent } = setupData;
        expect(searchRefinementsComponent.queryAllByText('Clear all')).toHaveLength(1);
      });

      describe('and the clear all button is clicked', () => {
        beforeEach(() => {
          const { searchRefinementsComponent } = setupData;
          fireEvent.click(searchRefinementsComponent.getByText('Clear all'));
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
            <SearchRefinements />,
            {},
            {
              aggregationResults: [termAgg],
              searchParameters: {
                projectId: '',
                filter: 'one:"two"'
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
            <SearchRefinements messages={{ clearAllButtonText: 'different text' }} />,
            {},
            {
              aggregationResults: [termAgg],
              searchParameters: {
                projectId: '',
                filter: 'one:"two"'
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
