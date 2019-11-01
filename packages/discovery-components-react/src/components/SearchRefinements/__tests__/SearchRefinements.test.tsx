import * as React from 'react';
import { render, RenderResult, fireEvent } from '@testing-library/react';
import { QueryTermAggregation } from '@disco-widgets/ibm-watson/discovery/v2';
import { wrapWithContext } from '../../../utils/testingUtils';
import { SearchRefinements } from '../SearchRefinements';
import { SearchContextIFC, SearchApiIFC } from '../../DiscoverySearch/DiscoverySearch';
import { refinementsQueryResponse } from '../fixtures/refinementsQueryResponse';
import collectionsResponse from '../fixtures/collectionsResponse';
import {
  noAvailableRefinementsMessage,
  invalidConfigurationMessage
} from '../utils/searchRefinementMessages';

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
  aggregations = refinementsQueryResponse.result.aggregations
): Setup => {
  const fetchAggregationsMock = jest.fn();
  const performSearchMock = jest.fn();
  const context: Partial<SearchContextIFC> = {
    aggregationResults: aggregations,
    collectionsResults: collectionsResponse.result,
    searchParameters: {
      projectId: '',
      filter: filter
    }
  };
  const api: Partial<SearchApiIFC> = {
    performSearch: performSearchMock,
    fetchAggregations: fetchAggregationsMock
  };
  const searchRefinementsComponent = render(
    wrapWithContext(
      <SearchRefinements
        showCollections={showCollections}
        configuration={[
          {
            type: 'term',
            field: 'author',
            count: 3
          },
          {
            type: 'term',
            field: 'subject',
            count: 4
          }
        ]}
      />,
      api,
      context
    )
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
    test('it calls fetchAggregations with configuration', () => {
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
            <SearchRefinements configuration={[{ field: 'one', type: 'term' }]} />,
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
            <SearchRefinements
              configuration={[{ field: 'one', type: 'term' }]}
              messages={{ clearAllButtonText: 'different text' }}
            />,
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

  describe('provides invalid error message in console when invalid configuration is provided', () => {
    const originalError = console.error;
    afterEach(() => (console.error = originalError));
    const consoleOutput: string[] = [];
    const mockedError = (output: string): any => {
      consoleOutput.push(output);
    };
    beforeEach(() => (console.error = mockedError));

    test('it provides invalid message in console error when empty array is provided for configuration', () => {
      const { context } = setup('');
      render(wrapWithContext(<SearchRefinements configuration={[]} />, {}, context));
      expect(consoleOutput).toEqual([invalidConfigurationMessage]);
    });
  });
});
