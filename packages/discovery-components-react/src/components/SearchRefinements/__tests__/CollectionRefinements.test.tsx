import * as React from 'react';
import { render, getNodeText, fireEvent, RenderResult } from '@testing-library/react';
import { wrapWithContext } from '../../../utils/testingUtils';
import { SearchContextIFC, SearchApiIFC } from '../../DiscoverySearch/DiscoverySearch';
import { SearchRefinements } from '../SearchRefinements';
import collectionsResponse from '../fixtures/collectionsResponse';

interface Setup {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  performSearchMock: jest.Mock<any, any>;
  collectionRefinementsComponent: RenderResult;
}

const setup = (collectionIds?: string[]): Setup => {
  const performSearchMock = jest.fn();
  const api: Partial<SearchApiIFC> = {
    performSearch: performSearchMock
  };
  const context: Partial<SearchContextIFC> = {
    collectionsResults: collectionsResponse,
    searchParameters: {
      project_id: '',
      collection_ids: collectionIds
    }
  };
  const collectionRefinementsComponent = render(
    wrapWithContext(
      <SearchRefinements
        showCollections={true}
        configuration={[
          {
            field: 'author',
            count: 3
          },
          {
            field: 'subject',
            count: 4
          }
        ]}
      />,
      api,
      context
    )
  );
  return {
    performSearchMock,
    collectionRefinementsComponent
  };
};

describe('CollectionRefinementsComponent', () => {
  describe('legend header elements', () => {
    test('contains header or collections refinements', () => {
      const { collectionRefinementsComponent } = setup();
      const collectionsHeaderField = collectionRefinementsComponent.getByText('Collections');
      expect(collectionsHeaderField).toBeDefined();
    });
  });

  describe('select placeholder element', () => {
    test('contains the proper text', () => {
      const { collectionRefinementsComponent } = setup();
      const placeholderText = collectionRefinementsComponent.getByText('Available collections');
      expect(placeholderText).toBeDefined();
    });
  });

  describe('collection_ids query param already set', () => {
    test('shows pre-selected count', () => {
      const { collectionRefinementsComponent } = setup(['deadspin9876']);
      const selectedCount = collectionRefinementsComponent.getByTitle('Clear all selected items');
      expect(getNodeText(selectedCount)).toEqual('1');
    });

    test('pre-selects collections set in query params', () => {
      const { collectionRefinementsComponent } = setup(['deadspin9876']);
      const collectionSelect = collectionRefinementsComponent.getByText('Available collections');
      fireEvent.click(collectionSelect);
      const selectedCheckbox = collectionRefinementsComponent.getByLabelText('deadspin');
      expect(selectedCheckbox).toHaveProperty('checked');
    });

    test('pre-selects collections excluded in query params', () => {
      const { collectionRefinementsComponent } = setup(['deadspin9876']);
      const collectionSelect = collectionRefinementsComponent.getByText('Available collections');
      fireEvent.click(collectionSelect);
      const selectedCheckbox = collectionRefinementsComponent.getByText('espn');
      expect(selectedCheckbox).not.toHaveProperty('checked');
    });
  });

  describe('collection_ids query param not set', () => {
    test('does not show pre-selected count', () => {
      const { collectionRefinementsComponent } = setup();
      const selectedCount = collectionRefinementsComponent.queryByTitle('Clear all selected items');
      expect(selectedCount).toBeNull();
    });
  });

  describe('selecting collection', () => {
    test('it calls performSearch', () => {
      const { collectionRefinementsComponent, performSearchMock } = setup();
      const collectionSelect = collectionRefinementsComponent.getByText('Available collections');
      fireEvent.click(collectionSelect);
      const deadspinCollection = collectionRefinementsComponent.getByLabelText('deadspin');
      fireEvent.click(deadspinCollection);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          offset: 0,
          collection_ids: ['deadspin9876']
        })
      );
    });
  });
});
