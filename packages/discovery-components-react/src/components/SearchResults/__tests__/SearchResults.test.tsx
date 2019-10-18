import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { wrapWithContext } from '../../../utils/testingUtils';
import { SearchResults } from '../SearchResults';
import { SearchContextIFC } from '../../DiscoverySearch/DiscoverySearch';

describe('<SearchResults />', () => {
  describe('When we have a value for matching_results', () => {
    describe('which is greater than 0', () => {
      const context: Partial<SearchContextIFC> = {
        searchResults: {
          matching_results: 1,
          results: [
            {
              document_id: 'some document_id'
            }
          ]
        }
      };
      test('renders the results', () => {
        const { getByText } = render(wrapWithContext(<SearchResults />, context));
        expect(getByText('some document_id')).toBeInTheDocument();
      });
    });

    describe('which is equal to 0', () => {
      const context: Partial<SearchContextIFC> = {
        searchResults: {
          matching_results: 0,
          results: []
        }
      };
      test('renders the no results found message', () => {
        const { getByText } = render(wrapWithContext(<SearchResults />, context));
        expect(getByText('There were no results found')).toBeInTheDocument();
      });
    });
  });

  describe('When we do not have a value for matching_results', () => {
    const context: Partial<SearchContextIFC> = {
      searchResults: {}
    };
    // TODO: include when we have loading states in our repo
    // describe('And we are in the middle of fetching query_results', () => {
    //   test('renders the loading spinner', () => {});
    // });
    describe('And we are not in the middle of fetching query_results', () => {
      test('renders the submit a query message', () => {
        const { container } = render(wrapWithContext(<SearchResults />, context));
        expect(container.children).toHaveLength(0);
      });
    });
  });

  describe('when passageLength is defined', () => {
    test('onUpdatePassageLength is called with the expected character count', () => {
      const context: Partial<SearchContextIFC> = {};
      const onUpdateQueryOptionsMock = jest.fn();
      context.onUpdateQueryOptions = onUpdateQueryOptionsMock;
      render(wrapWithContext(<SearchResults passageLength={20} />, context));
      expect(onUpdateQueryOptionsMock).toBeCalledTimes(1);
      expect(onUpdateQueryOptionsMock).toBeCalledWith({
        passages: { characters: 20, enabled: true }
      });
    });
  });

  describe('when passageLength is not defined', () => {
    test('onUpdatePassageLength is not called', () => {
      const context: Partial<SearchContextIFC> = {};
      const onUpdateQueryOptionsMock = jest.fn();
      context.onUpdateQueryOptions = onUpdateQueryOptionsMock;
      render(wrapWithContext(<SearchResults />, context));
      expect(onUpdateQueryOptionsMock).toBeCalledTimes(0);
    });
  });
});
