import * as React from 'react';
import { render, getNodeText, fireEvent } from '@testing-library/react';
import { wrapWithContext } from '../../../utils/testingUtils';
import { SearchContextIFC } from '../../DiscoverySearch/DiscoverySearch';
import { SearchRefinements } from '../SearchRefinements';
import collectionsResponse from '../fixtures/collectionsResponse';

const setup = (collectionIds?: string[]) => {
  const context: Partial<SearchContextIFC> = {
    collectionsResults: collectionsResponse,
    searchParameters: {
      project_id: '',
      collection_ids: collectionIds
    }
  };
  const onSearchMock = jest.fn();
  context.onSearch = onSearchMock;
  const onUpdateQueryOptions = jest.fn();
  context.onUpdateQueryOptions = onUpdateQueryOptions;
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
      context
    )
  );
  return {
    onSearchMock,
    onUpdateQueryOptions,
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
    test('it calls onUpdateSelectedCollections with collection id', () => {
      const { collectionRefinementsComponent, onUpdateQueryOptions } = setup();
      const collectionSelect = collectionRefinementsComponent.getByText('Available collections');
      fireEvent.click(collectionSelect);
      const deadspinCollection = collectionRefinementsComponent.getByLabelText('deadspin');
      onUpdateQueryOptions.mockReset();
      fireEvent.click(deadspinCollection);
      expect(onUpdateQueryOptions).toBeCalledTimes(1);
      expect(onUpdateQueryOptions).toBeCalledWith({
        collection_ids: ['deadspin9876'],
        offset: 0
      });
    });

    test('it calls onSearch', () => {
      const { collectionRefinementsComponent, onSearchMock } = setup();
      const collectionSelect = collectionRefinementsComponent.getByText('Available collections');
      fireEvent.click(collectionSelect);
      const deadspinCollection = collectionRefinementsComponent.getByLabelText('deadspin');
      fireEvent.click(deadspinCollection);
      expect(onSearchMock).toBeCalledTimes(1);
    });
  });
});
