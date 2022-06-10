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
  pageSizeSelect: HTMLElement;
  nextButton: HTMLElement;
  fullTree: React.ReactElement;
}

const setup = async (
  propUpdates: Partial<ResultsPaginationProps> = {},
  contextOverrides?: Partial<SearchContextIFC>
): Promise<Setup> => {
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

  const pageSizeSelect = await paginationComponent.findByLabelText('Items per page:');
  const nextButton = await paginationComponent.findByLabelText('Next page');

  return {
    performSearchMock,
    setSearchParametersMock,
    onChangeMock,
    pageSizeSelect,
    fullTree,
    nextButton,
    ...paginationComponent
  };
};

describe('ResultsPaginationComponent', () => {
  beforeEach(jest.resetAllMocks);

  test('uses count from search parameter', async () => {
    const { performSearchMock, nextButton, onChangeMock } = await setup(
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

    fireEvent.click(nextButton);
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

  describe('page size select', () => {
    test('calls onUpdateResultsPagination from first page', async () => {
      const { performSearchMock, pageSizeSelect, nextButton, onChangeMock } = await setup();

      fireEvent.change(pageSizeSelect, { target: { value: 20 } });
      fireEvent.click(nextButton);
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

  describe('i18n messages', () => {
    describe('when default messages are used and not overridden', () => {
      describe('itemRangeText', () => {
        test('itemRangeText uses the word results instead of the word items', async () => {
          const { getByText } = await setup(
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
        test('it uses and correctly formats overridden messages and default messages', async () => {
          const { getByText } = await setup(
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
