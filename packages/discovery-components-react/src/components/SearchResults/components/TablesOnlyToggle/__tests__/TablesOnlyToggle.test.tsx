import React from 'react';
import { render, fireEvent, RenderResult } from '@testing-library/react';
import {
  SearchContextIFC,
  SearchApiIFC,
  searchResponseStoreDefaults
} from '../../../../DiscoverySearch/DiscoverySearch';
import { SearchResults } from '../../../SearchResults';
import { wrapWithContext } from '../../../../../utils/testingUtils';
import overrideSearchResults from '../../../__fixtures__/searchResults';

describe('<TablesOnlyToggle />', () => {
  let context: Partial<SearchContextIFC>;
  let api: Partial<SearchApiIFC>;
  let searchResults: RenderResult;
  let toggle: HTMLElement;
  const setIsResultsPaginationComponentHiddenMock = jest.fn();
  beforeEach(() => {
    context = {
      searchResponseStore: {
        ...searchResponseStoreDefaults,
        data: overrideSearchResults
      }
    };
    api = {
      setIsResultsPaginationComponentHidden: setIsResultsPaginationComponentHiddenMock
    };
    searchResults = render(
      wrapWithContext(<SearchResults showTablesOnlyToggle={true} />, api, context)
    );
    toggle = searchResults.getByText('Show table results only');
  });
  describe('when toggling the toggle on', () => {
    beforeEach(() => {
      fireEvent.click(toggle);
    });
    afterEach(() => {
      setIsResultsPaginationComponentHiddenMock.mockClear();
    });
    test('only the tables search results are shown', () => {
      expect(searchResults.getAllByTestId('search-result-element-body-table').length).toBe(2);
    });
    test('it sets the ResultsPagination component to hidden', () => {
      expect(setIsResultsPaginationComponentHiddenMock.mock.calls.length).toBe(1);
      expect(setIsResultsPaginationComponentHiddenMock.mock.calls[0][0]).toBe(true);
    });
  });
  describe('when toggling the toggle off', () => {
    beforeEach(() => {
      fireEvent.click(toggle);
      fireEvent.click(toggle);
    });
    afterEach(() => {
      setIsResultsPaginationComponentHiddenMock.mockClear();
    });
    test('all regular search results are shown', () => {
      expect(searchResults.getAllByTestId('search-result-element-body-table').length).toBe(1);
      expect(searchResults.getAllByTestId('search-result-element-body-passage').length).toBe(2);
      expect(searchResults.getAllByTestId('search-result-element-body-null').length).toBe(2);
    });
    test('it sets the ResultsPagination component to be not hidden', () => {
      expect(setIsResultsPaginationComponentHiddenMock.mock.calls.length).toBe(2);
      expect(setIsResultsPaginationComponentHiddenMock.mock.calls[1][0]).toBe(false);
    });
  });
});
