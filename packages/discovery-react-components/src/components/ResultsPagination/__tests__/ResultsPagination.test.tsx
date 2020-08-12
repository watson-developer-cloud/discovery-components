import * as React from 'react';
import {
  SearchApiIFC,
  SearchContextIFC,
  searchResponseStoreDefaults
} from 'components/DiscoverySearch/DiscoverySearch';
import { render, fireEvent, RenderResult } from '@testing-library/react';
import ResultsPagination, { ResultsPaginationProps } from '../ResultsPagination';
import { wrapWithContext } from 'utils/testingUtils';

interface Setup extends RenderResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  performSearchMock: jest.Mock<any, any>;
  setSearchParametersMock: jest.Mock<any>;
  onChangeMock: jest.Mock;
  pageSizeSelect: Promise<HTMLElement>;
  fullTree: React.ReactElement;
  pageNumberSelect: Promise<HTMLElement>;
}

const setup = (
  propUpdates: Partial<ResultsPaginationProps> = {},
  contextOverrides?: Partial<SearchContextIFC>
): Setup => {
  const context: Partial<SearchContextIFC> = {
    // Pagination component won't render until it receives the componentSettings response
    componentSettings: {},
    searchResponseStore: {
      ...searchResponseStoreDefaults,
      data: {
        matching_results: 55
      }
    },
    ...contextOverrides
  };

  const performSearchMock = jest.fn();
  const setSearchParametersMock = jest.fn();
  const api: Partial<SearchApiIFC> = {
    performSearch: performSearchMock,
    setSearchParameters: setSearchParametersMock
  };
  const onChangeMock = jest.fn();

  const fullTree = wrapWithContext(
    <ResultsPagination {...propUpdates} onChange={onChangeMock} />,
    api,
    context
  );
  const paginationComponent = render(fullTree);

  const pageSizeSelect = paginationComponent.findByLabelText('Items per page:');
  const pageNumberSelect = paginationComponent.findByLabelText(/Page number, of [0-9]+ pages/);

  return {
    performSearchMock,
    setSearchParametersMock,
    onChangeMock,
    pageSizeSelect,
    pageNumberSelect,
    fullTree,
    ...paginationComponent
  };
};

describe('ResultsPaginationComponent', () => {
  test('uses count from search parameter', () => {
    const { performSearchMock, pageNumberSelect, onChangeMock } = setup(
      {},
      {
        searchResponseStore: {
          ...searchResponseStoreDefaults,
          data: {
            matching_results: 55
          },
          parameters: { projectId: '', count: 22 }
        }
      }
    );

    // Have to return here or else failed expectations aren't reported
    return pageNumberSelect.then(numberSelect => {
      fireEvent.change(numberSelect, { target: { value: 2 } });
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          count: 22,
          offset: 22
        }),
        false
      );
      // test exposed onChange function
      expect(onChangeMock).toBeCalledWith({
        page: 2,
        pageSize: 22
      });
    });
  });

  describe('page size select', () => {
    test('calls onUpdateResultsPagination from first page', () => {
      const { performSearchMock, pageSizeSelect, pageNumberSelect, onChangeMock } = setup();

      // Have to return here or else failed expectations aren't reported
      return Promise.all([pageSizeSelect, pageNumberSelect]).then(([sizeSelect, numberSelect]) => {
        fireEvent.change(sizeSelect, { target: { value: 20 } });
        fireEvent.change(numberSelect, { target: { value: 2 } });

        expect(performSearchMock).toBeCalledTimes(2);
        expect(performSearchMock).toBeCalledWith(
          expect.objectContaining({
            count: 20,
            offset: 20
          }),
          false
        );
        // tests exposed onChange function
        expect(onChangeMock).toBeCalledWith({
          page: 2,
          pageSize: 20
        });
      });
    });

    test('will add pageSize as a pageSize selection if it is not already included', () => {
      const { pageSizeSelect, getByText } = setup(
        { pageSize: 25, pageSizes: [10, 20, 30, 40, 50] },
        {
          searchResponseStore: {
            ...searchResponseStoreDefaults,
            parameters: { projectId: '', count: 25 }
          }
        }
      );

      // Have to return here or else failed expectations aren't reported
      return pageSizeSelect.then(() => {
        expect(getByText('25')).toBeInTheDocument();
      });
    });
  });

  describe('when there are component settings available', () => {
    describe('and there are no display parameters passed on ResultsPagination', () => {
      test('will update the count search param', () => {
        const { setSearchParametersMock, pageSizeSelect, rerender, fullTree } = setup(
          {},
          { componentSettings: { results_per_page: 30 } }
        );

        // Have to return here or else failed expectations aren't reported
        return pageSizeSelect.then(() => {
          rerender(fullTree);
          expect(setSearchParametersMock).toBeCalledTimes(1);
          expect(setSearchParametersMock).toBeCalledWith(expect.any(Function));
          const returnFunc = setSearchParametersMock.mock.calls[0][0];
          const returnValue = returnFunc();
          expect(returnValue).toEqual(
            expect.objectContaining({
              count: 30
            })
          );
        });
      });
    });

    describe('and there are some display parameters passed on ResultsPagination', () => {
      test('will update the count search param', () => {
        const { setSearchParametersMock, pageSizeSelect, rerender, fullTree } = setup(
          { pageSize: 18 },
          { componentSettings: { results_per_page: 30 } }
        );

        // Have to return here or else failed expectations aren't reported
        return pageSizeSelect.then(() => {
          rerender(fullTree);
          expect(setSearchParametersMock).toBeCalledTimes(1);
          expect(setSearchParametersMock).toBeCalledWith(expect.any(Function));
          const returnFunc = setSearchParametersMock.mock.calls[0][0];
          const returnValue = returnFunc();

          expect(returnValue).toEqual(
            expect.objectContaining({
              count: 18
            })
          );
        });
      });
    });
  });

  describe('i18n messages', () => {
    describe('when default messages are used and not overridden', () => {
      describe('itemRangeText', () => {
        test('itemRangeText uses the word results instead of the word items', () => {
          const { getByText } = setup(
            {},
            {
              searchResponseStore: {
                ...searchResponseStoreDefaults,
                parameters: { projectId: '', count: 25 },
                data: {
                  matching_results: 55
                }
              }
            }
          );

          const itemRangeText = getByText('1–25 of 55 results');
          expect(itemRangeText).toBeInTheDocument();
        });
      });
    });

    describe('when default messages are overridden', () => {
      describe('when itemRangeText and pageRangeText are overridden', () => {
        test('it uses and correctly formats overridden messages and default messages', () => {
          const { getByText } = setup(
            {
              messages: {
                itemRangeText: 'of {total} results {min} to {max}',
                pageRangeText: 'of pages {total}'
              }
            },
            {
              searchResponseStore: {
                ...searchResponseStoreDefaults,
                parameters: { projectId: '', count: 25 },
                data: {
                  matching_results: 55
                }
              }
            }
          );
          const overriddenItemRangeText = getByText('of 55 results 1 to 25');
          const overriddenPageRangeText = getByText('of pages 3');
          const defaultItemsPerPageText = getByText('Items per page:');
          expect(overriddenItemRangeText).toBeInTheDocument();
          expect(overriddenPageRangeText).toBeInTheDocument();
          expect(defaultItemsPerPageText).toBeInTheDocument();
        });
      });
    });
  });
});
