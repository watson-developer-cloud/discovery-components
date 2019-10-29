import React, { cloneElement } from 'react';
import { render, act, fireEvent, RenderResult } from '@testing-library/react';
import {
  DiscoverySearch,
  DiscoverySearchProps,
  SearchApi,
  SearchContext
} from '../DiscoverySearch';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
interface Setup {
  fullTree: JSX.Element;
  result: RenderResult;
  searchClient: Pick<DiscoveryV1, 'query' | 'getAutocompletion' | 'listCollections'>;
}

const setup = (props: Partial<DiscoverySearchProps>, children: JSX.Element): Setup => {
  class DummyClient {
    query(): Promise<void> {
      return Promise.resolve();
    }
    listCollections(): Promise<void> {
      return Promise.resolve();
    }
    getAutocompletion(): Promise<void> {
      return Promise.resolve();
    }
    getComponentSettings(): Promise<void> {
      return Promise.resolve();
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
    it('can override searchResponse', () => {
      const tree = (
        <SearchContext.Consumer>
          {({ searchResponse }) => (
            <span data-testid="value">{searchResponse && searchResponse.matching_results}</span>
          )}
        </SearchContext.Consumer>
      );
      const {
        fullTree,
        result: { getByTestId, rerender }
      } = setup({ overrideSearchResults: { matching_results: 1 } }, tree);
      expect(getByTestId('value').textContent).toEqual('1');
      rerender(cloneElement(fullTree, { overrideSearchResults: { matching_results: 2 } }));
      expect(getByTestId('value').textContent).toEqual('2');
    });

    it('can override searchParameters', () => {
      const tree = (
        <SearchContext.Consumer>
          {({ searchParameters }) => (
            <span data-testid="value">{searchParameters.natural_language_query}</span>
          )}
        </SearchContext.Consumer>
      );
      const {
        fullTree,
        result: { getByTestId, rerender }
      } = setup({ overrideQueryParameters: { natural_language_query: 'foo' } }, tree);
      expect(getByTestId('value').textContent).toEqual('foo');
      rerender(
        cloneElement(fullTree, { overrideQueryParameters: { natural_language_query: 'bar' } })
      );
      expect(getByTestId('value').textContent).toEqual('bar');
    });

    it('can override selectedResult', () => {
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
        result: { getByTestId, rerender }
      } = setup(
        {
          overrideSelectedResult: {
            document: { extracted_metadata: { title: 'foo' } },
            element: null,
            elementType: null
          }
        },
        tree
      );
      expect(getByTestId('value').textContent).toEqual('foo');
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

    it('can override autocompletionResults', () => {
      const tree = (
        <SearchContext.Consumer>
          {({ autocompletionResults }) => (
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
        result: { getByTestId, rerender }
      } = setup({ overrideAutocompletionResults: { completions: ['foo'] } }, tree);
      expect(getByTestId('value').textContent).toEqual('foo');
      rerender(cloneElement(fullTree, { overrideAutocompletionResults: { completions: ['bar'] } }));
      expect(getByTestId('value').textContent).toEqual('bar');
    });

    it('can override collectionsResults', () => {
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
    });
  });

  describe('api calls', () => {
    it('can call performSearch', async () => {
      const tree = (
        <SearchApi.Consumer>
          {({ performSearch }) => (
            <button onClick={() => performSearch({ project_id: '' })}>Action</button>
          )}
        </SearchApi.Consumer>
      );
      const {
        result: { getByText },
        searchClient
      } = setup({}, tree);
      const spy = jest.spyOn(searchClient, 'query');
      expect(spy).not.toHaveBeenCalled();
      act(() => {
        fireEvent.click(getByText('Action'));
      });
      expect(spy).toHaveBeenCalled();
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
      const spy = jest.spyOn(searchClient, 'getAutocompletion');
      expect(spy).not.toHaveBeenCalled();
      act(() => {
        fireEvent.click(getByText('Options'));
      });
      act(() => {
        fireEvent.click(getByText('Action'));
      });
      expect(spy).toHaveBeenCalled();
    });
  });
});
