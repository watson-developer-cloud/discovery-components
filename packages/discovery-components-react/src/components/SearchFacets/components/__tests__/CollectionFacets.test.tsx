import * as React from 'react';
import { render, getNodeText, fireEvent, RenderResult } from '@testing-library/react';
import { wrapWithContext } from '../../../../utils/testingUtils';
import { SearchContextIFC, SearchApiIFC } from '../../../DiscoverySearch/DiscoverySearch';
import { SearchFacets } from '../../SearchFacets';
import collectionsResponse from '../../__fixtures__/collectionsResponse';

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
      isError: false
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
    test('contains header or collections facets', () => {
      const { collectionFacetsComponent } = setup();
      const collectionsHeaderField = collectionFacetsComponent.getByText('Collections');
      expect(collectionsHeaderField).toBeDefined();
    });
  });

  describe('select placeholder element', () => {
    test('contains the proper text', () => {
      const { collectionFacetsComponent } = setup();
      const placeholderText = collectionFacetsComponent.getByText('Available collections');
      expect(placeholderText).toBeDefined();
    });
  });

  describe('collectionIds query param already set', () => {
    test('shows pre-selected count', () => {
      const { collectionFacetsComponent } = setup(['machine-learning']);
      const selectedCount = collectionFacetsComponent.getByTitle('Clear all selected items');
      expect(getNodeText(selectedCount)).toEqual('1');
    });

    test('pre-selects collections set in query params', () => {
      const { collectionFacetsComponent } = setup(['machine-learning']);
      const collectionSelect = collectionFacetsComponent.getByText('Available collections');
      fireEvent.click(collectionSelect);
      const selectedCheckbox = collectionFacetsComponent.getByLabelText('Machine Learning');
      expect(selectedCheckbox).toHaveProperty('checked');
    });

    test('pre-selects collections excluded in query params', () => {
      const { collectionFacetsComponent } = setup(['machine-learning']);
      const collectionSelect = collectionFacetsComponent.getByText('Available collections');
      fireEvent.click(collectionSelect);
      const selectedCheckbox = collectionFacetsComponent.getByText('AI Strategy');
      expect(selectedCheckbox).not.toHaveProperty('checked');
    });
  });

  describe('collectionIds query param not set', () => {
    test('does not show pre-selected count', () => {
      const { collectionFacetsComponent } = setup();
      const selectedCount = collectionFacetsComponent.queryByTitle('Clear all selected items');
      expect(selectedCount).toBeNull();
    });
  });

  describe('selecting collection', () => {
    test('it calls performSearch', () => {
      const { collectionFacetsComponent, performSearchMock } = setup();
      const collectionSelect = collectionFacetsComponent.getByText('Available collections');
      fireEvent.click(collectionSelect);
      const deadspinCollection = collectionFacetsComponent.getByLabelText('Machine Learning');
      fireEvent.click(deadspinCollection);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          offset: 0,
          collectionIds: ['machine-learning']
        })
      );
    });
  });
});
