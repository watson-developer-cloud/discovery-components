import * as React from 'react';
import { render } from '@testing-library/react';
import { wrapWithContext } from '../../../utils/testingUtils';
import { SearchContextIFC } from '../../DiscoverySearch/DiscoverySearch';
import { SearchRefinements } from '../SearchRefinements';
import refinementsQueryResponse from '../fixtures/refinementsQueryResponse';
import collectionsResponse from '../fixtures/collectionsResponse';
import {
  noAvailableRefinementsMessage,
  invalidConfigurationMessage
} from '../utils/searchRefinementMessages';

const setup = (
  filter: string,
  showCollections = false,
  aggregations = refinementsQueryResponse.aggregations
) => {
  const context: Partial<SearchContextIFC> = {
    aggregationResults: {
      aggregations: aggregations
    },
    collectionsResults: collectionsResponse,
    searchParameters: {
      project_id: '',
      filter: filter
    }
  };
  const onRefinementsMountMock = jest.fn();
  context.onRefinementsMount = onRefinementsMountMock;
  const onSearchMock = jest.fn();
  context.onSearch = onSearchMock;
  const onUpdateQueryOptionsMock = jest.fn();
  context.onUpdateQueryOptions = onUpdateQueryOptionsMock;
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
      context
    )
  );
  return {
    context,
    onRefinementsMountMock,
    onUpdateQueryOptionsMock,
    onSearchMock,
    searchRefinementsComponent
  };
};

describe('SearchRefinementsComponent', () => {
  describe('component load', () => {
    test('it calls onAggregationRequest with configuration', () => {
      const { onUpdateQueryOptionsMock } = setup('');
      expect(onUpdateQueryOptionsMock).toBeCalledTimes(1);
      expect(onUpdateQueryOptionsMock).toBeCalledWith({
        aggregation: '[term(author,count:3),term(subject,count:4)]'
      });
    });

    test('it does not calls onSearch', () => {
      const { onSearchMock } = setup('');
      expect(onSearchMock).not.toBeCalled();
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
    const mockedError = (output: string) => {
      consoleOutput.push(output);
    };
    beforeEach(() => (console.error = mockedError));

    test('it provides invalid message in console error when empty array is provided for configuration', () => {
      const { context } = setup('');
      render(wrapWithContext(<SearchRefinements configuration={[]} />, context));
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
          context
        )
      );
      expect(consoleOutput).toEqual([invalidConfigurationMessage, invalidConfigurationMessage]);
    });
  });
});
