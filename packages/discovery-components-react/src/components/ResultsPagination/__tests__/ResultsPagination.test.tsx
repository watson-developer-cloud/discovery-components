import * as React from 'react';
import { SearchApiIFC, SearchContextIFC } from '../../DiscoverySearch/DiscoverySearch';
import { render, fireEvent, RenderResult } from '@testing-library/react';
import { ResultsPagination } from '../ResultsPagination';
import { wrapWithContext } from '../../../utils/testingUtils';

interface Setup extends RenderResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  performSearchMock: jest.Mock<any, any>;
  pageSizeSelect: HTMLElement;
  pageNumberSelect: HTMLElement;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setup = (propUpdates?: any): Setup => {
  propUpdates = propUpdates || {};

  const performSearchMock = jest.fn();
  const api: Partial<SearchApiIFC> = {
    performSearch: performSearchMock
  };
  const context: Partial<SearchContextIFC> = {
    searchResponse: {
      matching_results: 55
    }
  };

  const paginationComponent = render(
    wrapWithContext(<ResultsPagination {...propUpdates} />, api, context)
  );

  const pageSizeSelect = paginationComponent.getByLabelText('Items per page:');
  const pageNumberSelect = paginationComponent.getByLabelText('Page number, of 6 pages');

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
        })
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
        })
      );
    });
  });
});
