import React, { FC } from 'react';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { render, fireEvent, waitForDomChange, wait } from '@testing-library/react';
import { createDummyResponsePromise, createDummyResponse } from '../testingUtils';
import {
  useSearchResultsApi,
  SearchResponseStore,
  useFetchDocumentsApi,
  FetchDocumentsResponseStore,
  useAutocompleteApi,
  AutocompleteStore,
  useFieldsApi,
  FieldsStore,
  GlobalAggregationsResponseStore,
  useGlobalAggregationsApi
} from '../useDataApi';
import { SearchClient } from 'components/DiscoverySearch/types';

class BaseSearchClient implements SearchClient {
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

  public async listFields(): Promise<any> {
    return createDummyResponsePromise({});
  }
}

class SingleQueryResultSearchClient extends BaseSearchClient {
  public async query(): Promise<any> {
    return createDummyResponsePromise({ matching_results: 1 });
  }
}

class AggregationResultSearchClient extends BaseSearchClient {
  public async query(): Promise<any> {
    return createDummyResponsePromise<DiscoveryV2.QueryResponse>({
      aggregations: [{ type: 'term' }]
    });
  }
}

class ErrorSearchClient extends BaseSearchClient {
  public async query(): Promise<any> {
    const error = new Error();
    error.message =
      'You have exceeded the number of daily queries allowed for your plan. You can resume requests after the daily reset.';
    // @ts-expect-error - `body` isn't a field on `Error`
    error.body = {
      status_code: 400,
      errors: [
        {
          code: 'query_daily_limit',
          message:
            'You have exceeded the number of daily queries allowed for your plan. You can resume requests after the daily reset.'
        }
      ]
    };
    return Promise.reject(error);
  }

  public async listFields(): Promise<any> {
    return Promise.reject();
  }
}

class SlowClient extends BaseSearchClient {
  public async query(): Promise<any> {
    return await new Promise(resolve => {
      setTimeout(() => {
        resolve({ result: { matching_results: 1 } });
      }, 100);
    });
  }
}

interface TestSearchStoreComponentProps {
  searchParameters?: DiscoveryV2.QueryParams;
  searchResults?: DiscoveryV2.QueryResponse;
  searchClient?: SearchClient;
  callback?: (result: DiscoveryV2.QueryResponse) => void;
}

const TestSearchStoreComponent: FC<TestSearchStoreComponentProps> = ({
  searchParameters = {
    projectId: ''
  },
  searchResults,
  searchClient = new BaseSearchClient(),
  callback
}) => {
  const [searchResponseStore, searchResponseApi] = useSearchResultsApi(
    searchParameters,
    searchClient,
    searchResults
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
      <button
        data-testid="setSearchParametersLegacy"
        onClick={() =>
          searchResponseApi.setSearchParameters({ projectId: 'set', returnFields: ['field'] })
        }
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

    test('can set initial search parameters with legacy returnFields', () => {
      const searchParameters = {
        projectId: 'foo',
        returnFields: ['bar']
      };
      const result = render(<TestSearchStoreComponent searchParameters={searchParameters} />);
      const json: SearchResponseStore = JSON.parse(
        result.getByTestId('searchResponseStore').textContent || '{}'
      );

      expect(json.parameters).toEqual(
        expect.objectContaining({
          projectId: 'foo',
          _return: ['bar']
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
    test('it sets loading state', async () => {
      const result = render(
        <TestSearchStoreComponent searchClient={new SingleQueryResultSearchClient()} />
      );
      const performSearchButton = result.getByTestId('performSearch');

      fireEvent.click(performSearchButton);
      const json: SearchResponseStore = JSON.parse(
        result.getByTestId('searchResponseStore').textContent || '{}'
      );
      expect(json.isLoading).toEqual(true);
      await wait(); // wait for component to finish rendering (prevent "act" warning)
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
      expect(json.error).toEqual({
        message:
          'You have exceeded the number of daily queries allowed for your plan. You can resume requests after the daily reset.',
        body: {
          status_code: 400,
          errors: [
            {
              code: 'query_daily_limit',
              message:
                'You have exceeded the number of daily queries allowed for your plan. You can resume requests after the daily reset.'
            }
          ]
        }
      });
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
        const result = render(<TestSearchStoreComponent searchClient={new SlowClient()} />);
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

  describe('when calling setSearchParametersLegacy', () => {
    test('it sets search parameters', () => {
      const result = render(<TestSearchStoreComponent searchClient={new BaseSearchClient()} />);
      const setSearchParametersLegacyButton = result.getByTestId('setSearchParametersLegacy');

      fireEvent.click(setSearchParametersLegacyButton);
      const json: SearchResponseStore = JSON.parse(
        result.getByTestId('searchResponseStore').textContent || '{}'
      );
      expect(json.parameters).toEqual(
        expect.objectContaining({
          projectId: 'set',
          _return: ['field']
        })
      );
    });
  });

  interface TestAutocompleteStoreComponentProps {
    autocompleteParameters?: DiscoveryV2.GetAutocompletionParams;
    autocompletionResults?: DiscoveryV2.Completions;
    searchClient?: SearchClient;
  }

  const TestAutocompleteStoreComponent: FC<TestAutocompleteStoreComponentProps> = ({
    autocompleteParameters = {
      projectId: '',
      prefix: ''
    },
    autocompletionResults,
    searchClient = new BaseSearchClient()
  }) => {
    const [autocompleteStore, autocompleteApi] = useAutocompleteApi(
      autocompleteParameters,
      searchClient,
      autocompletionResults
    );

    return (
      <>
        <button
          data-testid="fetchAutocompletions"
          onClick={e => {
            autocompleteApi.fetchAutocompletions({
              ...autocompleteParameters,
              prefix: e.currentTarget.value || autocompleteParameters.prefix
            });
          }}
        />
        <button
          data-testid="setAutocompletions"
          onClick={() => autocompleteApi.setAutocompletions({ completions: ['foo'] })}
        />
        <div data-testid="autocompleteStore">{JSON.stringify(autocompleteStore)}</div>
      </>
    );
  };

  describe('useAutocompleteApi', () => {
    describe('initial state', () => {
      test('can initialize reducer state', () => {
        const result = render(<TestAutocompleteStoreComponent />);
        const json: AutocompleteStore = JSON.parse(
          result.getByTestId('autocompleteStore').textContent || '{}'
        );

        expect(json.isError).toEqual(false);
        expect(json.isLoading).toEqual(false);
      });

      test('can set initial autocomplete parameters', () => {
        const autocompleteParameters = {
          projectId: 'foo',
          prefix: 'fo'
        };
        const result = render(
          <TestAutocompleteStoreComponent autocompleteParameters={autocompleteParameters} />
        );
        const json: AutocompleteStore = JSON.parse(
          result.getByTestId('autocompleteStore').textContent || '{}'
        );

        expect(json.parameters).toEqual(
          expect.objectContaining({
            projectId: 'foo',
            prefix: 'fo'
          })
        );
      });

      test('can set initial autocomplete results', () => {
        const autocompletionResults = {
          completions: ['compete', 'complete']
        };
        const result = render(
          <TestAutocompleteStoreComponent autocompletionResults={autocompletionResults} />
        );
        const json: SearchResponseStore = JSON.parse(
          result.getByTestId('autocompleteStore').textContent || '{}'
        );

        expect(json.data).toEqual(
          expect.objectContaining({
            completions: ['compete', 'complete']
          })
        );
      });
    });

    describe('when calling fetchAutocompletions', () => {
      class SingleAutocompletionResultSearchClient extends BaseSearchClient {
        public async getAutocompletion(): Promise<any> {
          return createDummyResponsePromise({ completions: ['complete'] });
        }
      }
      test('it sets loading state', async () => {
        const result = render(
          <TestAutocompleteStoreComponent
            searchClient={new SingleAutocompletionResultSearchClient()}
          />
        );
        const fetchAutocompletionsButton = result.getByTestId('fetchAutocompletions');

        fireEvent.click(fetchAutocompletionsButton);
        const json: AutocompleteStore = JSON.parse(
          result.getByTestId('autocompleteStore').textContent || '{}'
        );
        expect(json.isLoading).toEqual(true);
        await wait(); // wait for component to finish rendering (prevent "act" warning)
      });

      test('it sets error state', async () => {
        class AutocompleteErrorSearchClient extends BaseSearchClient {
          public async getAutocompletion(): Promise<any> {
            return Promise.reject();
          }
        }
        const result = render(
          <TestAutocompleteStoreComponent searchClient={new AutocompleteErrorSearchClient()} />
        );
        const fetchAutocompletionsButton = result.getByTestId('fetchAutocompletions');

        fireEvent.click(fetchAutocompletionsButton);
        await waitForDomChange({ container: result.container });
        const json: AutocompleteStore = JSON.parse(
          result.getByTestId('autocompleteStore').textContent || '{}'
        );
        expect(json.isError).toEqual(true);
      });

      test('sets the autocomplete results', async () => {
        const result = render(
          <TestAutocompleteStoreComponent
            searchClient={new SingleAutocompletionResultSearchClient()}
          />
        );
        const fetchAutocompletionsButton = result.getByTestId('fetchAutocompletions');
        fireEvent.click(fetchAutocompletionsButton);
        await waitForDomChange({ container: result.container });
        const json: AutocompleteStore = JSON.parse(
          result.getByTestId('autocompleteStore').textContent || '{}'
        );

        expect(json.data).toEqual(
          expect.objectContaining({
            completions: ['complete']
          })
        );
      });

      describe('cancellation', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let consoleError: jest.SpyInstance<any, any>;
        class SlowAutocompleteClient extends BaseSearchClient {
          public async getAutocompletion(): Promise<any> {
            return await new Promise(resolve => {
              setTimeout(() => {
                resolve({ result: { completions: ['complete'] } });
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
          const result = render(
            <TestAutocompleteStoreComponent searchClient={new SlowAutocompleteClient()} />
          );
          const { unmount, getByTestId } = result;
          const fetchAutocompletionsButton = getByTestId('fetchAutocompletions');

          fireEvent.click(fetchAutocompletionsButton);
          unmount();

          jest.runOnlyPendingTimers();
          expect(consoleError).not.toHaveBeenCalled();
        });
      });

      describe('freshest data', () => {
        class TwoAutocompleteRequestsClient extends BaseSearchClient {
          public async getAutocompletion(
            autocompletionParameters?: DiscoveryV2.GetAutocompletionParams
          ): Promise<any> {
            if (autocompletionParameters && autocompletionParameters.prefix === 'co') {
              return createDummyResponse({ completions: ['coal', 'complete'] });
            } else {
              return new Promise(resolve => {
                setTimeout(() => {
                  resolve({ result: { completions: ['complete'] } });
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
          const autocompleteParameters = {
            projectId: '',
            prefix: 'com'
          };
          const { getByTestId } = render(
            <TestAutocompleteStoreComponent
              autocompleteParameters={autocompleteParameters}
              searchClient={new TwoAutocompleteRequestsClient()}
            />
          );
          const fetchAutocompletionsButton = getByTestId('fetchAutocompletions');

          fireEvent.click(fetchAutocompletionsButton);
          fireEvent.click(fetchAutocompletionsButton);
          fireEvent.click(fetchAutocompletionsButton);
          fireEvent.click(fetchAutocompletionsButton, { target: { value: 'co' } });
          jest.runAllTimers();
          await wait(() => {
            const json: AutocompleteStore = JSON.parse(
              getByTestId('autocompleteStore').textContent || '{}'
            );
            if (json && json.data && json.data.completions && json.data.completions.length === 1) {
              throw new Error();
            }
          });

          const json: AutocompleteStore = JSON.parse(
            getByTestId('autocompleteStore').textContent || '{}'
          );

          expect(json.data).toEqual(
            expect.objectContaining({
              completions: ['coal', 'complete']
            })
          );
        });
      });
    });

    describe('when calling setAutocompletions', () => {
      test('it sets autocompletions response', () => {
        const result = render(
          <TestAutocompleteStoreComponent searchClient={new BaseSearchClient()} />
        );
        const setAutocompletionsButton = result.getByTestId('setAutocompletions');

        fireEvent.click(setAutocompletionsButton);
        const json: AutocompleteStore = JSON.parse(
          result.getByTestId('autocompleteStore').textContent || '{}'
        );
        expect(json.data).toEqual(
          expect.objectContaining({
            completions: ['foo']
          })
        );
      });
    });
  });
});

describe('useFetchDocumentsApi', () => {
  const collectionId = '12345-12345-12345-12345';
  interface TestFetchDocumentsStoreComponentProps {
    searchParameters?: DiscoveryV2.QueryParams;
    searchClient?: SearchClient;
    callback?: (result: DiscoveryV2.QueryResponse) => void;
  }

  const TestFetchDocumentsStoreComponent: FC<TestFetchDocumentsStoreComponentProps> = ({
    searchParameters = {
      projectId: ''
    },
    searchClient = new BaseSearchClient(),
    callback = () => {}
  }) => {
    const [fetchDocumentsStore, fetchDocumentsApi] = useFetchDocumentsApi(
      searchParameters,
      searchClient
    );

    return (
      <>
        <button
          data-testid="fetchDocuments"
          onClick={e =>
            fetchDocumentsApi.fetchDocuments(e.currentTarget.value || '', [collectionId], callback)
          }
        />
        <div data-testid="fetchDocumentsStore">{JSON.stringify(fetchDocumentsStore)}</div>
      </>
    );
  };

  describe('initial state', () => {
    test('can initialize reducer state', () => {
      const result = render(<TestFetchDocumentsStoreComponent />);
      const json: FetchDocumentsResponseStore = JSON.parse(
        result.getByTestId('fetchDocumentsStore').textContent || '{}'
      );

      expect(json.isError).toEqual(false);
      expect(json.isLoading).toEqual(false);
    });
  });

  describe('when calling fetchDocuments', () => {
    test('it sets loading state', async () => {
      const result = render(
        <TestFetchDocumentsStoreComponent searchClient={new SingleQueryResultSearchClient()} />
      );
      const fetchDocumentsButton = result.getByTestId('fetchDocuments');

      fireEvent.click(fetchDocumentsButton);
      const json: FetchDocumentsResponseStore = JSON.parse(
        result.getByTestId('fetchDocumentsStore').textContent || '{}'
      );
      expect(json.isLoading).toEqual(true);
      await wait(); // wait for component to finish rendering (prevent "act" warning)
    });

    test('it sets error state', async () => {
      const result = render(
        <TestFetchDocumentsStoreComponent searchClient={new ErrorSearchClient()} />
      );
      const fetchDocumentsButton = result.getByTestId('fetchDocuments');

      fireEvent.click(fetchDocumentsButton);
      await waitForDomChange({ container: result.container });
      const json: FetchDocumentsResponseStore = JSON.parse(
        result.getByTestId('fetchDocumentsStore').textContent || '{}'
      );
      expect(json.isError).toEqual(true);
    });

    test('set filter with initial search parameters', async () => {
      const checkParametersMock = jest.fn();
      class ParameterTrackingSearchClient extends BaseSearchClient {
        public async query(searchParams?: DiscoveryV2.QueryParams): Promise<any> {
          checkParametersMock(searchParams);
          return createDummyResponse({});
        }
      }
      const searchParameters: DiscoveryV2.QueryParams = {
        projectId: 'foo',
        _return: [],
        aggregation: '',
        passages: {},
        tableResults: {}
      };
      const result = render(
        <TestFetchDocumentsStoreComponent
          searchClient={new ParameterTrackingSearchClient()}
          searchParameters={searchParameters}
        />
      );
      const fetchDocumentsButton = result.getByTestId('fetchDocuments');

      fireEvent.click(fetchDocumentsButton, { target: { value: 'filter_string' } });
      expect(checkParametersMock).toHaveBeenCalledWith({
        projectId: 'foo',
        collection_ids: ['12345-12345-12345-12345'],
        _return: [],
        aggregation: '',
        passages: {},
        tableResults: {},
        filter: 'filter_string'
      });
      await wait(); // wait for component to finish rendering (prevent "act" warning)
    });

    describe('callback', () => {
      test('calls callback method with results', async () => {
        const callbackMock = jest.fn();
        const result = render(<TestFetchDocumentsStoreComponent callback={callbackMock} />);
        const fetchDocumentsButton = result.getByTestId('fetchDocuments');

        fireEvent.click(fetchDocumentsButton);
        await waitForDomChange({ container: result.container });

        expect(callbackMock).toHaveBeenCalledWith({});
      });
    });

    describe('cancellation', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let consoleError: jest.SpyInstance<any, any>;
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
        const result = render(<TestFetchDocumentsStoreComponent searchClient={new SlowClient()} />);
        const { unmount, getByTestId } = result;
        const fetchDocumentsButton = getByTestId('fetchDocuments');

        fireEvent.click(fetchDocumentsButton);
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
          if (searchParams && searchParams.filter === 'fast') {
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
          <TestFetchDocumentsStoreComponent
            searchParameters={searchParameters}
            searchClient={new TwoRequestsClient()}
          />
        );
        const fetchDocumentsButton = getByTestId('fetchDocuments');

        fireEvent.click(fetchDocumentsButton, { target: { value: 'slow' } });
        fireEvent.click(fetchDocumentsButton, { target: { value: 'slow' } });
        fireEvent.click(fetchDocumentsButton, { target: { value: 'fast' } });
        jest.runAllTimers();
        await wait(() => {
          const json: FetchDocumentsResponseStore = JSON.parse(
            getByTestId('fetchDocumentsStore').textContent || '{}'
          );
          if (json && json.data && json.data.matching_results !== 1) {
            throw new Error();
          }
        });

        const json: FetchDocumentsResponseStore = JSON.parse(
          getByTestId('fetchDocumentsStore').textContent || '{}'
        );

        expect(json.data).toEqual(
          expect.objectContaining({
            matching_results: FAST_TOTAL
          })
        );
      });
    });
  });
});

describe('useFieldsApi', () => {
  interface TestFieldsStoreComponentProps {
    searchParameters?: DiscoveryV2.QueryParams;
    searchClient?: SearchClient;
  }

  const TestFieldsStoreComponent: FC<TestFieldsStoreComponentProps> = ({
    searchParameters = {
      projectId: ''
    },
    searchClient = new BaseSearchClient()
  }) => {
    const [fieldsStore, fieldsApi] = useFieldsApi(searchParameters, searchClient);
    return (
      <>
        <button data-testid="fetchFields" onClick={() => fieldsApi.fetchFields()} />
        <div data-testid="fieldsStore">{JSON.stringify(fieldsStore)}</div>
      </>
    );
  };

  describe('initial state', () => {
    test('can initialize reducer state', () => {
      const result = render(<TestFieldsStoreComponent />);
      const json: FieldsStore = JSON.parse(result.getByTestId('fieldsStore').textContent || '{}');

      expect(json.isError).toEqual(false);
      expect(json.isLoading).toEqual(false);
    });
  });

  describe('when calling fetchFields', () => {
    test('it sets the loading state', async () => {
      const result = render(<TestFieldsStoreComponent searchClient={new BaseSearchClient()} />);

      const fetchFieldsButton = result.getByTestId('fetchFields');

      fireEvent.click(fetchFieldsButton);
      const json: FieldsStore = JSON.parse(result.getByTestId('fieldsStore').textContent || '{}');
      expect(json.isLoading).toEqual(true);
      await wait(); // wait for component to finish rendering (prevent "act" warning)
    });

    test('it sets error state', async () => {
      const result = render(<TestFieldsStoreComponent searchClient={new ErrorSearchClient()} />);
      const fetchFieldsButton = result.getByTestId('fetchFields');

      fireEvent.click(fetchFieldsButton);
      await waitForDomChange({ container: result.container });
      const json: FieldsStore = JSON.parse(result.getByTestId('fieldsStore').textContent || '{}');
      expect(json.isError).toEqual(true);
    });

    describe('cancellation', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let consoleError: jest.SpyInstance<any, any>;
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
        const result = render(<TestFieldsStoreComponent searchClient={new SlowClient()} />);
        const { unmount, getByTestId } = result;
        const fetchDocumentsButton = getByTestId('fetchFields');

        fireEvent.click(fetchDocumentsButton);
        unmount();

        jest.runOnlyPendingTimers();
        expect(consoleError).not.toHaveBeenCalled();
      });
    });
  });
});

describe('useGlobalAggregationsApi', () => {
  interface TestGlobalAggregationsStoreComponentProps {
    searchParameters?: DiscoveryV2.QueryParams;
    searchClient?: SearchClient;
    aggregations?: DiscoveryV2.QueryAggregation[];
  }

  const TestGlobalAggregationsStoreComponent: FC<TestGlobalAggregationsStoreComponentProps> = ({
    searchParameters = {
      projectId: ''
    },
    searchClient = new BaseSearchClient(),
    aggregations = []
  }) => {
    const [globalAggregationsStore, globalAggregationsApi] = useGlobalAggregationsApi(
      searchParameters,
      searchClient,
      aggregations
    );
    return (
      <>
        <button
          data-testid="fetchGlobalAggregations"
          onClick={() =>
            globalAggregationsApi.fetchGlobalAggregations(globalAggregationsStore.parameters)
          }
        />
        <button
          data-testid="fetchGlobalAggregationsWithoutStoring"
          onClick={() =>
            globalAggregationsApi.fetchGlobalAggregationsWithoutStoring(
              globalAggregationsStore.parameters
            )
          }
        />
        <div data-testid="globalAggregationsStore">{JSON.stringify(globalAggregationsStore)}</div>
      </>
    );
  };

  describe('initial state', () => {
    test('can initialize reducer state', () => {
      const result = render(<TestGlobalAggregationsStoreComponent />);
      const json: GlobalAggregationsResponseStore = JSON.parse(
        result.getByTestId('globalAggregationsStore').textContent || '{}'
      );

      expect(json.isError).toEqual(false);
      expect(json.isLoading).toEqual(false);
    });
  });

  describe('when calling fetchGlobalAggregations', () => {
    test('it sets the loading state', async () => {
      const result = render(
        <TestGlobalAggregationsStoreComponent searchClient={new BaseSearchClient()} />
      );

      const fetchGlobalAggregationsButton = result.getByTestId('fetchGlobalAggregations');

      fireEvent.click(fetchGlobalAggregationsButton);
      const json: GlobalAggregationsResponseStore = JSON.parse(
        result.getByTestId('globalAggregationsStore').textContent || '{}'
      );
      expect(json.isLoading).toEqual(true);
      await wait(); // wait for component to finish rendering (prevent "act" warning)
    });

    test('it sets error state', async () => {
      const result = render(
        <TestGlobalAggregationsStoreComponent searchClient={new ErrorSearchClient()} />
      );
      const fetchGlobalAggregationsButton = result.getByTestId('fetchGlobalAggregations');

      fireEvent.click(fetchGlobalAggregationsButton);
      await waitForDomChange({ container: result.container });
      const json: GlobalAggregationsResponseStore = JSON.parse(
        result.getByTestId('globalAggregationsStore').textContent || '{}'
      );
      expect(json.isError).toEqual(true);
    });

    test('transforms query response to aggregations array', async () => {
      const result = render(
        <TestGlobalAggregationsStoreComponent searchClient={new AggregationResultSearchClient()} />
      );
      const fetchGlobalAggregationsButton = result.getByTestId('fetchGlobalAggregations');

      fireEvent.click(fetchGlobalAggregationsButton);
      await waitForDomChange({ container: result.container });
      const json: GlobalAggregationsResponseStore = JSON.parse(
        result.getByTestId('globalAggregationsStore').textContent || '{}'
      );
      expect(json.data).toEqual([{ type: 'term' }]);
    });
  });

  describe('when calling fetchGlobalAggregationsWithoutStoring', () => {
    test('does not update the store with a payload and keeps isLoading true', async () => {
      const result = render(
        <TestGlobalAggregationsStoreComponent searchClient={new AggregationResultSearchClient()} />
      );
      const fetchGlobalAggregationsWithoutStoringButton = result.getByTestId(
        'fetchGlobalAggregationsWithoutStoring'
      );

      fireEvent.click(fetchGlobalAggregationsWithoutStoringButton);
      const json: GlobalAggregationsResponseStore = JSON.parse(
        result.getByTestId('globalAggregationsStore').textContent || '{}'
      );
      expect(json.isLoading).toEqual(true);
      expect(json.data).toEqual([]);
    });
  });
});
