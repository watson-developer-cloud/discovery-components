import React, { FC } from 'react';
import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';
import { render, fireEvent, waitForDomChange, wait } from '@testing-library/react';
import { createDummyResponsePromise, createDummyResponse } from '../testingUtils';
import { useSearchResultsApi, SearchResponseStore } from '../useDataApi';

class BaseSearchClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async query(): Promise<any> {
    return createDummyResponsePromise({});
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getAutocompletion(): Promise<any> {
    return createDummyResponsePromise({});
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async listCollections(): Promise<any> {
    return createDummyResponsePromise({});
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getComponentSettings(): Promise<any> {
    return createDummyResponsePromise({});
  }
}

class SingleQueryResultSearchClient extends BaseSearchClient {
  public async query(): Promise<any> {
    return createDummyResponsePromise({ matching_results: 1 });
  }
}

class ErrorSearchClient extends BaseSearchClient {
  public async query(): Promise<any> {
    return Promise.reject();
  }
}

interface TestSearchStoreComponentProps {
  searchParameters?: DiscoveryV2.QueryParams;
  searchResults?: DiscoveryV2.QueryResponse;
  searchClient?: Pick<
    DiscoveryV2,
    'query' | 'getAutocompletion' | 'listCollections' | 'getComponentSettings'
  >;
  callback?: (result: DiscoveryV2.QueryResponse) => void;
}

const TestSearchStoreComponent: FC<TestSearchStoreComponentProps> = ({
  searchParameters = {
    projectId: ''
  },
  searchResults = null,
  searchClient = new BaseSearchClient(),
  callback
}) => {
  const [searchResponseStore, searchResponseApi] = useSearchResultsApi(
    searchParameters,
    searchResults,
    searchClient
  );

  return (
    <>
      <button
        data-testid="performSearch"
        onClick={() => searchResponseApi.performSearch(callback)}
      />
      <button
        data-testid="setSearchResponse"
        onClick={() => searchResponseApi.setSearchResponse({ matching_results: 2 })}
      />
      <button
        data-testid="setSearchParameters"
        onClick={() => searchResponseApi.setSearchParameters({ projectId: 'set' })}
      />
      <div data-testid="searchResponseStore">{JSON.stringify(searchResponseStore)}</div>
    </>
  );
};

describe('useSearchResultsApi', () => {
  describe('initial state', () => {
    test('can initialize reducer state', () => {
      const result = render(<TestSearchStoreComponent />);
      const json: SearchResponseStore = JSON.parse(
        result.getByTestId('searchResponseStore').textContent || '{}'
      );

      expect(json.isError).toEqual(false);
      expect(json.isLoading).toEqual(false);
    });

    test('can set initial search parameters', () => {
      const searchParameters = {
        projectId: 'foo',
        naturalLanguageQuery: 'bar'
      };
      const result = render(<TestSearchStoreComponent searchParameters={searchParameters} />);
      const json: SearchResponseStore = JSON.parse(
        result.getByTestId('searchResponseStore').textContent || '{}'
      );

      expect(json.parameters).toEqual(
        expect.objectContaining({
          projectId: 'foo',
          naturalLanguageQuery: 'bar'
        })
      );
    });

    test('can set initial search results', () => {
      const searchResults = {
        matching_results: 1
      };
      const result = render(<TestSearchStoreComponent searchResults={searchResults} />);
      const json: SearchResponseStore = JSON.parse(
        result.getByTestId('searchResponseStore').textContent || '{}'
      );

      expect(json.data).toEqual(
        expect.objectContaining({
          matching_results: 1
        })
      );
    });
  });

  describe('when calling performSearch', () => {
    test('it sets loading state', () => {
      const result = render(
        <TestSearchStoreComponent searchClient={new SingleQueryResultSearchClient()} />
      );
      const performSearchButton = result.getByTestId('performSearch');

      fireEvent.click(performSearchButton);
      const json: SearchResponseStore = JSON.parse(
        result.getByTestId('searchResponseStore').textContent || '{}'
      );
      expect(json.isLoading).toEqual(true);
    });

    test('it sets error state', async () => {
      const result = render(<TestSearchStoreComponent searchClient={new ErrorSearchClient()} />);
      const performSearchButton = result.getByTestId('performSearch');

      fireEvent.click(performSearchButton);
      await waitForDomChange({ container: result.container });
      const json: SearchResponseStore = JSON.parse(
        result.getByTestId('searchResponseStore').textContent || '{}'
      );
      expect(json.isError).toEqual(true);
    });

    test('sets the search results', async () => {
      const result = render(
        <TestSearchStoreComponent searchClient={new SingleQueryResultSearchClient()} />
      );
      const performSearchButton = result.getByTestId('performSearch');
      fireEvent.click(performSearchButton);
      await waitForDomChange({ container: result.container });
      const json: SearchResponseStore = JSON.parse(
        result.getByTestId('searchResponseStore').textContent || '{}'
      );

      expect(json.data).toEqual(
        expect.objectContaining({
          matching_results: 1
        })
      );
    });

    describe('callback', () => {
      test('calls callback method with results', async () => {
        const callbackMock = jest.fn();
        const result = render(<TestSearchStoreComponent callback={callbackMock} />);
        const performSearchButton = result.getByTestId('performSearch');
        fireEvent.click(performSearchButton);
        await waitForDomChange({ container: result.container });

        expect(callbackMock).toHaveBeenCalledWith({});
      });
    });

    describe('cancellation', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let consoleError: jest.SpyInstance<any, any>;
      class SlowQueryClient extends BaseSearchClient {
        public async query(): Promise<any> {
          return await new Promise(resolve => {
            setTimeout(() => {
              resolve({ result: { matching_results: 1 } });
            }, 100);
          });
        }
      }
      beforeAll(() => {
        consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      });

      afterAll(() => {
        consoleError.mockRestore();
      });

      afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
      });

      test('does not attempt to set state when unmounted (to prevent memory leaks)', () => {
        jest.useFakeTimers();
        const result = render(<TestSearchStoreComponent searchClient={new SlowQueryClient()} />);
        const { unmount, getByTestId } = result;
        const performSearchButton = getByTestId('performSearch');

        fireEvent.click(performSearchButton);
        unmount();

        jest.runOnlyPendingTimers();
        expect(consoleError).not.toHaveBeenCalled();
      });
    });

    describe('freshest data', () => {
      const SLOW_TOTAL = 2;
      const FAST_TOTAL = 1;
      class TwoRequestsClient extends BaseSearchClient {
        public async query(searchParams?: DiscoveryV2.QueryParams): Promise<any> {
          if (searchParams && searchParams.projectId === 'set') {
            return createDummyResponse({ matching_results: FAST_TOTAL });
          } else {
            return new Promise(resolve => {
              setTimeout(() => {
                resolve({ result: { matching_results: SLOW_TOTAL } });
              }, 100);
            });
          }
        }
      }
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      test('retrieves the latest request', async () => {
        jest.useFakeTimers();
        const searchParameters = {
          projectId: 'foo'
        };
        const { getByTestId } = render(
          <TestSearchStoreComponent
            searchParameters={searchParameters}
            searchClient={new TwoRequestsClient()}
          />
        );
        const performSearchButton = getByTestId('performSearch');
        const setSearchParametersButton = getByTestId('setSearchParameters');

        fireEvent.click(performSearchButton);
        fireEvent.click(performSearchButton);
        fireEvent.click(performSearchButton);
        fireEvent.click(setSearchParametersButton);
        fireEvent.click(performSearchButton);
        jest.runAllTimers();
        await wait(() => {
          const json: SearchResponseStore = JSON.parse(
            getByTestId('searchResponseStore').textContent || '{}'
          );
          if (json && json.data && json.data.matching_results !== 1) {
            throw new Error();
          }
        });

        const json: SearchResponseStore = JSON.parse(
          getByTestId('searchResponseStore').textContent || '{}'
        );

        expect(json.data).toEqual(
          expect.objectContaining({
            matching_results: FAST_TOTAL
          })
        );
      });
    });
  });

  describe('when calling setSearchResponse', () => {
    test('it sets search response', () => {
      const result = render(<TestSearchStoreComponent searchClient={new BaseSearchClient()} />);
      const setSearchResponseButton = result.getByTestId('setSearchResponse');

      fireEvent.click(setSearchResponseButton);
      const json: SearchResponseStore = JSON.parse(
        result.getByTestId('searchResponseStore').textContent || '{}'
      );
      expect(json.data).toEqual(
        expect.objectContaining({
          matching_results: 2
        })
      );
    });
  });

  describe('when calling setSearchParameters', () => {
    test('it sets search parameters', () => {
      const result = render(<TestSearchStoreComponent searchClient={new BaseSearchClient()} />);
      const setSearchParametersButton = result.getByTestId('setSearchParameters');

      fireEvent.click(setSearchParametersButton);
      const json: SearchResponseStore = JSON.parse(
        result.getByTestId('searchResponseStore').textContent || '{}'
      );
      expect(json.parameters).toEqual(
        expect.objectContaining({
          projectId: 'set'
        })
      );
    });
  });
});
