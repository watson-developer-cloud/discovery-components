import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContextIFC, SearchApiIFC } from '../../DiscoverySearch/DiscoverySearch';
import { wrapWithContext } from '../../../utils/testingUtils';
import { SearchResults } from '../SearchResults';

describe('<SearchResults />', () => {
  describe('When we have a value for matching_results', () => {
    describe('which is greater than 0', () => {
      const context: Partial<SearchContextIFC> = {
        searchResponse: {
          matching_results: 1,
          results: [
            {
              document_id: 'some document_id'
            }
          ]
        }
      };
      test('renders the results', () => {
        const { getByText } = render(wrapWithContext(<SearchResults />, {}, context));
        expect(getByText('some document_id')).toBeInTheDocument();
      });
    });

    describe('which is equal to 0', () => {
      const context: Partial<SearchContextIFC> = {
        searchResponse: {
          matching_results: 0,
          results: []
        }
      };
      test('renders the no results found message', () => {
        const { getByText } = render(wrapWithContext(<SearchResults />, {}, context));
        expect(getByText('There were no results found')).toBeInTheDocument();
      });
    });
  });

  describe('When we do not have results', () => {
    const context: Partial<SearchContextIFC> = {
      searchResponse: null
    };
    // TODO: include when we have loading states in our repo
    // describe('And we are in the middle of fetching query_results', () => {
    //   test('renders the loading spinner', () => {});
    // });
    describe('And we are not in the middle of fetching query_results', () => {
      test('renders nothing', () => {
        const { container } = render(wrapWithContext(<SearchResults />, {}, context));
        expect(container.children).toHaveLength(0);
      });
    });
  });

  describe('when passageLength is defined', () => {
    test('onUpdatePassageLength is called with the expected character count', () => {
      const setSearchParametersMock = jest.fn();
      const context: Partial<SearchContextIFC> = {};
      const api: Partial<SearchApiIFC> = {
        setSearchParameters: setSearchParametersMock
      };
      render(wrapWithContext(<SearchResults passageLength={20} />, api, context));
      expect(setSearchParametersMock).toBeCalledTimes(1);
      expect(setSearchParametersMock).toBeCalledWith(expect.any(Function));
      // TODO: how to assert an anonymous function's return value?
      // expect.objectContaining({
      //   passages: { characters: 20, enabled: true }
      // })
    });
  });

  describe('when passageLength is not defined', () => {
    test('onUpdatePassageLength is not called', () => {
      const setSearchParametersMock = jest.fn();
      const context: Partial<SearchContextIFC> = {};
      const api: Partial<SearchApiIFC> = {
        setSearchParameters: setSearchParametersMock
      };
      render(wrapWithContext(<SearchResults />, api, context));
      expect(setSearchParametersMock).toBeCalledTimes(0);
    });
  });
});
