import * as React from 'react';
import { screen, render, fireEvent, RenderResult } from '@testing-library/react';
import { wrapWithContext } from 'utils/testingUtils';
import { SearchContextIFC, SearchApiIFC } from 'components/DiscoverySearch/DiscoverySearch';
import SearchFacets from 'components/SearchFacets/SearchFacets';
import collectionsResponse from 'components/SearchFacets/__fixtures__/collectionsResponse';

interface Setup {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  performSearchMock: jest.Mock<any, any>;
  collectionFacetsComponent: RenderResult;
}

const setup = (collectionIds?: string[]): Setup => {
  const performSearchMock = jest.fn();
  const api: Partial<SearchApiIFC> = {
    performSearch: performSearchMock
  };
  const context: Partial<SearchContextIFC> = {
    collectionsResults: collectionsResponse.result,
    searchResponseStore: {
      parameters: {
        projectId: '',
        collectionIds,
        aggregation: '[term(author,count:3),term(subject,count:4)]'
      },
      data: null,
      isLoading: false,
      isError: false,
      error: null
    }
  };
  const collectionFacetsComponent = render(wrapWithContext(<SearchFacets />, api, context));
  return {
    performSearchMock,
    collectionFacetsComponent
  };
};

describe('CollectionFacetsComponent', () => {
  describe('legend header elements', () => {
    test('contains header or collections facets', async () => {
      const { collectionFacetsComponent } = setup();
      const collectionsHeaderField = await collectionFacetsComponent.findByText('Collections');
      expect(collectionsHeaderField).toBeDefined();
    });
  });

  describe('select placeholder element', () => {
    test('contains the proper text', async () => {
      const { collectionFacetsComponent } = setup();
      const placeholderText = await collectionFacetsComponent.findByText('Available collections');
      expect(placeholderText).toBeDefined();
    });
  });

  describe('collectionIds query param already set', () => {
    test('shows pre-selected count', async () => {
      const { collectionFacetsComponent } = setup(['machine-learning']);
      const selectedCount = await collectionFacetsComponent.findByTitle('Clear all selected items');
      expect(selectedCount.parentElement?.textContent).toEqual('1');
    });

    test('pre-selects collections set in query params', async () => {
      const { collectionFacetsComponent } = setup(['machine-learning']);
      const collectionSelect = await collectionFacetsComponent.findByText('Available collections');
      fireEvent.click(collectionSelect);
      const selectedCheckbox = collectionFacetsComponent.getByText('Machine Learning');
      expect(selectedCheckbox).toHaveAttribute('data-contained-checkbox-state', 'true');
    });

    test('pre-selects collections excluded in query params', async () => {
      const { collectionFacetsComponent } = setup(['machine-learning']);
      const collectionSelect = await collectionFacetsComponent.findByText('Available collections');
      fireEvent.click(collectionSelect);
      const selectedCheckbox = collectionFacetsComponent.getByText('AI Strategy');
      expect(selectedCheckbox).not.toHaveAttribute('data-contained-checkbox-state', 'true');
    });
  });

  describe('collectionIds query param not set', () => {
    test('does not show pre-selected count', async () => {
      const { collectionFacetsComponent } = setup();
      // wait for component to finish rendering (prevent "act" warning)
      await screen.findByText('Collections');
      const selectedCount = collectionFacetsComponent.queryByTitle('Clear all selected items');
      expect(selectedCount).toBeNull();
    });
  });

  describe('selecting collections', () => {
    test('it calls performSearch with correct collectionIds', async () => {
      const { collectionFacetsComponent, performSearchMock } = setup();
      const collectionSelect = await collectionFacetsComponent.findByText('Available collections');
      fireEvent.click(collectionSelect);
      const machineLearningCollection = collectionFacetsComponent.getByText('Machine Learning');
      fireEvent.click(machineLearningCollection);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          offset: 0,
          collectionIds: ['machine-learning']
        })
      );
      const aiStrategyCollection = collectionFacetsComponent.getByLabelText('AI Strategy');
      fireEvent.click(aiStrategyCollection);
      expect(performSearchMock).toBeCalledTimes(2);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          offset: 0,
          collectionIds: ['machine-learning', 'ai-strategy']
        })
      );
    });
  });
});
