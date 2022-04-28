import React, { cloneElement } from 'react';
import { render, fireEvent, RenderResult, wait } from '@testing-library/react';
import DiscoverySearch, {
  DiscoverySearchProps,
  SearchApi,
  SearchContext
} from '../DiscoverySearch';
import { createDummyResponsePromise } from 'utils/testingUtils';
import { SearchClient } from '../types';
interface Setup {
  fullTree: JSX.Element;
  result: RenderResult;
  searchClient: SearchClient;
}

const setup = (props: Partial<DiscoverySearchProps>, children: JSX.Element): Setup => {
  class DummyClient {
    query() {
      return createDummyResponsePromise({});
    }
    listCollections() {
      return createDummyResponsePromise({});
    }
    getAutocompletion() {
      return createDummyResponsePromise({});
    }
    getComponentSettings() {
      return createDummyResponsePromise({});
    }
    listFields() {
      return createDummyResponsePromise({});
    }
  }
  const searchClient = new DummyClient();
  const defaultProps: DiscoverySearchProps = {
    searchClient,
    projectId: '',
    ...props
  };
  const fullTree = <DiscoverySearch {...defaultProps}>{children}</DiscoverySearch>;
  return {
    fullTree,
    searchClient,
    result: render(fullTree)
  };
};

describe('DiscoverySearch', () => {
  describe('overrides', () => {
    it('can override searchResponse', async () => {
      const tree = (
        <SearchContext.Consumer>
          {({ searchResponseStore: { data: searchResponse } }) => (
            <span data-testid="value">{searchResponse && searchResponse.matching_results}</span>
          )}
        </SearchContext.Consumer>
      );
      const {
        fullTree,
        result: { findByTestId, getByTestId, rerender }
      } = setup({ overrideSearchResults: { matching_results: 1 } }, tree);
      expect((await findByTestId('value')).textContent).toEqual('1');
      rerender(cloneElement(fullTree, { overrideSearchResults: { matching_results: 2 } }));
      expect(getByTestId('value').textContent).toEqual('2');
    });

    it('can override searchParameters', async () => {
      const tree = (
        <SearchContext.Consumer>
          {({ searchResponseStore: { parameters } }) => (
            <span data-testid="value">{parameters.naturalLanguageQuery}</span>
          )}
        </SearchContext.Consumer>
      );
      const {
        fullTree,
        result: { findByTestId, getByTestId, rerender }
      } = setup({ overrideQueryParameters: { naturalLanguageQuery: 'foo' } }, tree);
      expect((await findByTestId('value')).textContent).toEqual('foo');
      rerender(
        cloneElement(fullTree, {
          overrideQueryParameters: { naturalLanguageQuery: 'bar', count: 1 }
        })
      );
      expect(getByTestId('value').textContent).toEqual('bar');
    });

    it('can override selectedResult', async () => {
      const tree = (
        <SearchContext.Consumer>
          {({ selectedResult }) => (
            <span data-testid="value">
              {selectedResult &&
                selectedResult.document &&
                selectedResult.document.extracted_metadata.title}
            </span>
          )}
        </SearchContext.Consumer>
      );
      const {
        fullTree,
        result: { findByTestId, getByTestId, rerender }
      } = setup(
        {
          overrideSelectedResult: {
            document: {
              document_id: 'document_id',
              result_metadata: {
                collection_id: 'collection_id'
              },
              extracted_metadata: { title: 'foo' }
            },
            element: null,
            elementType: null
          }
        },
        tree
      );
      expect((await findByTestId('value')).textContent).toEqual('foo');
      rerender(
        cloneElement(fullTree, {
          overrideSelectedResult: {
            document: { extracted_metadata: { title: 'bar' } },
            element: null,
            elementType: null
          }
        })
      );
      expect(getByTestId('value').textContent).toEqual('bar');
    });

    it('can override autocompletionResults', async () => {
      const tree = (
        <SearchContext.Consumer>
          {({ autocompletionStore: { data: autocompletionResults } }) => (
            <span data-testid="value">
              {autocompletionResults &&
                autocompletionResults.completions &&
                autocompletionResults.completions[0]}
            </span>
          )}
        </SearchContext.Consumer>
      );
      const {
        fullTree,
        result: { findByTestId, getByTestId, rerender }
      } = setup({ overrideAutocompletionResults: { completions: ['foo'] } }, tree);
      expect((await findByTestId('value')).textContent).toEqual('foo');
      rerender(cloneElement(fullTree, { overrideAutocompletionResults: { completions: ['bar'] } }));
      expect(getByTestId('value').textContent).toEqual('bar');
    });

    it('can override collectionsResults', async () => {
      const tree = (
        <SearchContext.Consumer>
          {({ collectionsResults }) => (
            <span data-testid="value">
              {collectionsResults &&
                collectionsResults.collections &&
                collectionsResults.collections[0] &&
                collectionsResults.collections[0].name}
            </span>
          )}
        </SearchContext.Consumer>
      );
      const {
        fullTree,
        result: { getByTestId, rerender }
      } = setup({ overrideCollectionsResults: { collections: [{ name: 'foo' }] } }, tree);

      expect(getByTestId('value').textContent).toEqual('foo');

      rerender(
        cloneElement(fullTree, { overrideCollectionsResults: { collections: [{ name: 'bar' }] } })
      );
      expect(getByTestId('value').textContent).toEqual('bar');

      await wait(); // wait for component to finish rendering (prevent "act" warning)
    });

    it('overrides aggregation results and keeps aggregationResults in sync with globalAggregationsResponseStore', async () => {
      const tree = (
        <SearchContext.Consumer>
          {({
            aggregationResults,
            globalAggregationsResponseStore: { data: globalAggResults }
          }) => (
            <>
              <span data-testid="aggResults">
                {aggregationResults && aggregationResults[0].type}
              </span>
              <span data-testid="globalAggResponseStore">
                {globalAggResults && globalAggResults[0].type}
              </span>
            </>
          )}
        </SearchContext.Consumer>
      );
      const {
        result: { getByTestId }
      } = setup({ overrideAggregationResults: [{ type: 'term' }] }, tree);
      expect(getByTestId('globalAggResponseStore').textContent).toEqual('term');
      // testing that aggregationResults is updated to be in sync with globalAggregationsResponseStore data
      // to support it until deprecated in next major release
      expect(getByTestId('aggResults').textContent).toEqual('term');
      await wait(); // wait for component to finish rendering (prevent "act" warning)
    });

    it('can override componentSettings', async () => {
      const tree = (
        <SearchContext.Consumer>
          {({ componentSettings }) => (
            <span data-testid="value">
              {componentSettings && componentSettings.results_per_page}
            </span>
          )}
        </SearchContext.Consumer>
      );
      const {
        fullTree,
        result: { getByTestId, rerender }
      } = setup({ overrideComponentSettings: { results_per_page: 5 } }, tree);

      expect(getByTestId('value').textContent).toEqual('5');

      rerender(cloneElement(fullTree, { overrideComponentSettings: { results_per_page: 10000 } }));
      expect(getByTestId('value').textContent).toEqual('10000');

      await wait(); // wait for component to finish rendering (prevent "act" warning)
    });
  });

  describe('api calls', () => {
    it('can call performSearch', async () => {
      const tree = (
        <SearchApi.Consumer>
          {({ performSearch }) => (
            <button onClick={() => performSearch({ projectId: '' })}>Action</button>
          )}
        </SearchApi.Consumer>
      );
      const {
        result: { getByText },
        searchClient
      } = setup({}, tree);
      await wait(); // wait for component to finish rendering (prevent "act" warning)

      const spy = jest.spyOn(searchClient, 'query');
      expect(spy).not.toHaveBeenCalled();
      fireEvent.click(getByText('Action'));
      expect(spy).toHaveBeenCalled();
      await wait(); // wait for component to finish rendering (prevent "act" warning)
    });

    it('can call performSearch once with resetAggregations = false and filter set', async () => {
      const tree = (
        <SearchApi.Consumer>
          {({ performSearch }) => (
            <button onClick={() => performSearch({ projectId: '', filter: 'foo' }, false)}>
              Action
            </button>
          )}
        </SearchApi.Consumer>
      );
      const {
        result: { getByText },
        searchClient
      } = setup({}, tree);
      await wait(); // wait for component to finish rendering (prevent "act" warning)

      const spy = jest.spyOn(searchClient, 'query');
      expect(spy).not.toHaveBeenCalled();
      fireEvent.click(getByText('Action'));
      expect(spy).toHaveBeenCalledTimes(1);
      await wait(); // wait for component to finish rendering (prevent "act" warning)
    });

    it('can call performSearch twice with resetAggregations = true and filter set', async () => {
      const tree = (
        <SearchApi.Consumer>
          {({ performSearch }) => (
            <button onClick={() => performSearch({ projectId: '', filter: 'foo' }, true)}>
              Action
            </button>
          )}
        </SearchApi.Consumer>
      );
      const {
        result: { getByText },
        searchClient
      } = setup({}, tree);
      await wait(); // wait for component to finish rendering (prevent "act" warning)

      const spy = jest.spyOn(searchClient, 'query');
      expect(spy).not.toHaveBeenCalled();
      fireEvent.click(getByText('Action'));
      await wait(); // wait for component to finish rendering (prevent "act" warning)
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('can call fetchDocuments', async () => {
      const tree = (
        <SearchApi.Consumer>
          {({ fetchDocuments }) => (
            <button
              onClick={() =>
                fetchDocuments('document_id::bar', ['12345-12345-12345-12345'], undefined)
              }
            >
              Action
            </button>
          )}
        </SearchApi.Consumer>
      );
      const {
        result: { getByText },
        searchClient
      } = setup({ projectId: 'foo' }, tree);
      await wait(); // wait for component to finish rendering (prevent "act" warning)

      const spy = jest.spyOn(searchClient, 'query');
      expect(spy).not.toHaveBeenCalled();
      fireEvent.click(getByText('Action'));
      expect(spy).toHaveBeenCalledWith({
        projectId: 'foo',
        filter: 'document_id::bar',
        collection_ids: ['12345-12345-12345-12345'],
        aggregation: '',
        passages: {
          enabled: false
        },
        _return: [],
        tableResults: {
          enabled: false
        }
      });
      await wait(); // wait for component to finish rendering (prevent "act" warning)
    });

    it('can call setAutocompletionOptions then fetchAutocompletions', async () => {
      const autocompletionOptions = {
        updateAutocompletions: true,
        completionsCount: 1,
        minCharsToAutocomplete: 1,
        splitSearchQuerySelector: ' '
      };
      const tree = (
        <SearchApi.Consumer>
          {({ fetchAutocompletions, setAutocompletionOptions }) => (
            <>
              <button onClick={() => setAutocompletionOptions(autocompletionOptions)}>
                Options
              </button>
              <button onClick={() => fetchAutocompletions('foo')}>Action</button>
            </>
          )}
        </SearchApi.Consumer>
      );
      const {
        result: { getByText },
        searchClient
      } = setup({}, tree);
      await wait(); // wait for component to finish rendering (prevent "act" warning)

      const spy = jest.spyOn(searchClient, 'getAutocompletion');
      expect(spy).not.toHaveBeenCalled();
      fireEvent.click(getByText('Options'));
      fireEvent.click(getByText('Action'));
      expect(spy).toHaveBeenCalledWith({
        projectId: '',
        prefix: 'foo',
        count: 1
      });
      await wait(); // wait for component to finish rendering (prevent "act" warning)
    });

    it('can call fetchFields', async () => {
      const tree = (
        <SearchApi.Consumer>
          {({ fetchFields }) => <button onClick={() => fetchFields()}>Action</button>}
        </SearchApi.Consumer>
      );
      const {
        result: { getByText },
        searchClient
      } = setup({}, tree);
      await wait(); // wait for component to finish rendering (prevent "act" warning)

      const spy = jest.spyOn(searchClient, 'listFields');
      expect(spy).not.toHaveBeenCalled();
      fireEvent.click(getByText('Action'));
      expect(spy).toHaveBeenCalledWith({
        projectId: ''
      });
      await wait(); // wait for component to finish rendering (prevent "act" warning)
    });
  });
});
