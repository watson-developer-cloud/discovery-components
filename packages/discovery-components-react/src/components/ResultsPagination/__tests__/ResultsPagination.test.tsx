import * as React from 'react';
import { SearchApiIFC, SearchContextIFC } from '../../DiscoverySearch/DiscoverySearch';
import { render, fireEvent, RenderResult } from '@testing-library/react';
import { ResultsPagination } from '../ResultsPagination';
import { wrapWithContext } from '../../../utils/testingUtils';
import '@testing-library/jest-dom/extend-expect';

interface Setup extends RenderResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  performSearchMock: jest.Mock<any, any>;
  pageSizeSelect: HTMLElement;
  pageNumberSelect: HTMLElement;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setup = (propUpdates: any = {}, contextOverrides?: Partial<SearchContextIFC>): Setup => {
  const context: Partial<SearchContextIFC> = {
    ...contextOverrides,
    searchResponse: {
      matching_results: 55
    }
  };

  const performSearchMock = jest.fn();
  const api: Partial<SearchApiIFC> = {
    performSearch: performSearchMock
  };

  const paginationComponent = render(
    wrapWithContext(<ResultsPagination {...propUpdates} />, api, context)
  );

  const pageSizeSelect = paginationComponent.getByLabelText('Items per page:');
  const pageNumberSelect = paginationComponent.getByLabelText(/Page number, of [0-9]+ pages/);

  return {
    performSearchMock,
    pageSizeSelect,
    pageNumberSelect,
    ...paginationComponent
  };
};

describe('ResultsPaginationComponent', () => {
  describe('page number select', () => {
    test('calls performSearch', () => {
      const { performSearchMock, pageNumberSelect } = setup();
      fireEvent.change(pageNumberSelect, { target: { value: 2 } });

      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          offset: 10
        }),
        false
      );
    });
  });

  describe('page size select', () => {
    test('calls onUpdateResultsPagination from first page', () => {
      const { performSearchMock, pageNumberSelect, pageSizeSelect } = setup();
      fireEvent.change(pageSizeSelect, { target: { value: 20 } });
      fireEvent.change(pageNumberSelect, { target: { value: 2 } });

      expect(performSearchMock).toBeCalledTimes(2);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          offset: 20
        }),
        false
      );
    });
    test('will add pageSize as a pageSize selection if it is not already included', () => {
      const { getByText } = setup({ pageSize: 25, pageSizes: [10, 20, 30, 40, 50] });
      expect(getByText('25')).toBeInTheDocument();
    });
  });

  describe('when there are component settings available', () => {
    describe('and there are no display parameters passed on ResultsPagination', () => {
      test('will render the component settings', () => {
        const { performSearchMock, pageNumberSelect } = setup(
          {},
          { componentSettings: { results_per_page: 30 }, searchResponse: { matching_results: 180 } }
        );
        fireEvent.change(pageNumberSelect, { target: { value: 2 } });
        expect(performSearchMock).toBeCalledWith(
          expect.objectContaining({
            offset: 30
          }),
          false
        );
      });
    });
    describe('and there are some display parameters passed on ResultsPagination', () => {
      test('will render the display parameters', () => {
        const { performSearchMock, pageNumberSelect } = setup(
          { pageSize: 10 },
          { componentSettings: { results_per_page: 30 } }
        );
        fireEvent.change(pageNumberSelect, { target: { value: 2 } });
        expect(performSearchMock).toBeCalledWith(
          expect.objectContaining({
            offset: 10
          }),
          false
        );
      });
    });
  });

  describe('itemRangeText', () => {
    test('itemRangeText uses the word results instead of the word items', () => {
      const { getByText } = setup({}, { componentSettings: { results_per_page: 25 } });
      const itemRangeText = getByText('1–25 of 55 results');
      expect(itemRangeText).toBeInTheDocument();
    });
  });
});
