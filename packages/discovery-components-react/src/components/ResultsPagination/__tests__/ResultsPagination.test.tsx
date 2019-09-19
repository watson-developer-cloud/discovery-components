import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { ResultsPagination } from '../ResultsPagination';
import { SearchContext } from '../../DiscoverySearch/DiscoverySearch';
import { number } from '@storybook/addon-knobs';

const setup = (propUpdates?: any) => {
  propUpdates = propUpdates || {};

  const paginationMock = jest.fn();
  const searchMock = jest.fn();
  const paginationComponent = render(
    <SearchContext.Provider
      value={{
        onSearch: searchMock,
        onUpdateNaturalLanguageQuery: jest.fn(),
        onUpdateResultsPagination: paginationMock,
        searchResults: {
          matching_results: 55
        },
        searchParameters: {
          environment_id: '',
          collection_id: ''
        }
      }}
    >
      <ResultsPagination {...propUpdates} />
    </SearchContext.Provider>
  );

  const pageSizeSelect = paginationComponent.getByLabelText('Items per page:');
  const pageNumberSelect = paginationComponent.getByLabelText('Page number, of 6 pages');

  return {
    paginationMock,
    searchMock,
    pageSizeSelect,
    pageNumberSelect,
    ...paginationComponent
  };
};

describe('ResultsPaginationComponent', () => {
  describe('page number select', () => {
    test('calls onUpdateResultsPagination', () => {
      const { paginationMock, pageNumberSelect } = setup();
      fireEvent.change(pageNumberSelect, { target: { value: 2 } });

      expect(paginationMock).toBeCalledTimes(1);
      expect(paginationMock.mock.calls[0][0]).toBe(10);
    });

    test('calls onSubmit', () => {
      const { searchMock, pageNumberSelect } = setup();
      fireEvent.change(pageNumberSelect, { target: { value: 2 } });

      expect(searchMock).toBeCalledTimes(1);
    });
  });

  describe('page size select', () => {
    test('calls onUpdateResultsPagination from first page', () => {
      const { paginationMock, pageNumberSelect, pageSizeSelect } = setup();
      fireEvent.change(pageSizeSelect, { target: { value: 20 } });
      fireEvent.change(pageNumberSelect, { target: { value: 2 } });

      expect(paginationMock).toBeCalledTimes(2);
      expect(paginationMock.mock.calls[1][0]).toBe(20);
    });

    test('calls onSubmit', () => {
      const { searchMock, pageSizeSelect } = setup({ page: 2 });
      fireEvent.change(pageSizeSelect, { target: { value: 20 } });

      expect(searchMock).toBeCalledTimes(1);
    });
  });
});

// describe('input element', () => {
//     test('contains default placeholder', () => {
//       const { input } = setup();
//       expect(input).toBeDefined();
//     });

//     test('can provide custom placeholder', () => {
//       const { input } = setup({ placeholder: 'RIGHT HERE' });
//       expect(input).toBeDefined();
//     });
//   });

//   describe('submit button', () => {
//     test('exists', () => {
//       const { button } = setup();
//       expect(button).toBeDefined();
//     });

//     test('calls querySubmit action', () => {
//       const querySubmitAction = jest.fn();
//       const { button } = setup({ querySubmit: querySubmitAction });
//       fireEvent.click(button);
//       expect(querySubmitAction).toHaveBeenCalledTimes(1);
//     });
//   });

//   describe('autocomplete', () => {
//     test('defaults to enabled', () => {
//       const { input, getByText } = setup();
//       fireEvent.change(input, { target: { value: 'ab' } });
//       expect(getByText('ability')).toBeDefined();
//     });

//     test('defaults to 3 entries', () => {
//       const { input, queryAllByTestId } = setup();
//       fireEvent.change(input, { target: { value: 'te' } });
//       expect(queryAllByTestId('suggestion')).toHaveLength(5);
//     });

//     test('can be disabled', async () => {
//       const { input, queryByText } = setup({ suggestions: { enabled: false } });
//       fireEvent.change(input, { target: { value: 'ab' } });
//       const suggestion = queryByText('ability');
//       expect(suggestion).toBeNull();
//     });

//     test('can change number suggestion returned', () => {
//       const { input, queryAllByTestId } = setup({ suggestions: { enabled: true, limit: 10 } });
//       fireEvent.change(input, { target: { value: 'te' } });
//       expect(queryAllByTestId('suggestion')).toHaveLength(10);
//     });
//   });
// });
