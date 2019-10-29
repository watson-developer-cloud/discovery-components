import * as React from 'react';
import { render, RenderResult } from '@testing-library/react';
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
  searchRefinementsComponent: RenderResult;
}

const setup = (
  filter: string,
  showCollections = false,
  aggregations = refinementsQueryResponse.result.aggregations
): Setup => {
  const fetchAggregationsMock = jest.fn();
  const context: Partial<SearchContextIFC> = {
    aggregationResults: {
      aggregations: aggregations
    },
    collectionsResults: collectionsResponse.result,
    searchParameters: {
      projectId: '',
      filter: filter
    }
  };
  const api: Partial<SearchApiIFC> = {
    fetchAggregations: fetchAggregationsMock
  };
  const searchRefinementsComponent = render(
    wrapWithContext(
      <SearchRefinements
        showCollections={showCollections}
        configuration={[
          {
            field: 'author',
            count: 3
          },
          {
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

    test('it provides invalid message in console error when field is missing in provided configuration', () => {
      const { context } = setup('');
      render(
        wrapWithContext(
          <SearchRefinements
            configuration={[
              {
                field: 'enriched_text.entities.text',
                count: 10
              },
              {
                count: 5
              }
            ]}
          />,
          {},
          context
        )
      );
      expect(consoleOutput).toEqual([invalidConfigurationMessage, invalidConfigurationMessage]);
    });
  });
});
