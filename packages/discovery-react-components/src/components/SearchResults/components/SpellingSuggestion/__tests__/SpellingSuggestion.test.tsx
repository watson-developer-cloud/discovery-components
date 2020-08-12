import React from 'react';
import { render, fireEvent, RenderResult } from '@testing-library/react';
import {
  SearchContextIFC,
  SearchApiIFC,
  searchResponseStoreDefaults
} from 'components/DiscoverySearch/DiscoverySearch';
import { wrapWithContext } from 'utils/testingUtils';
import { SpellingSuggestion } from '../SpellingSuggestion';

describe('SpellingSuggestion', () => {
  describe('When spelling suggestions enabled', () => {
    let renderResult: RenderResult;
    const performSearchMock = jest.fn();
    const onChangeMock = jest.fn();
    const setSearchParametersMock = jest.fn();
    const fetchAutocompletionsMock = jest.fn();

    const context: Partial<SearchContextIFC> = {
      searchResponseStore: {
        ...searchResponseStoreDefaults,
        data: {
          suggested_query: 'cunningham'
        }
      }
    };
    const api: Partial<SearchApiIFC> = {
      performSearch: performSearchMock,
      setSearchParameters: setSearchParametersMock,
      fetchAutocompletions: fetchAutocompletionsMock
    };

    beforeEach(() => {
      renderResult = render(
        wrapWithContext(
          <SpellingSuggestion spellingSuggestionPrefix="Did you mean:" onChange={onChangeMock} />,
          api,
          context
        )
      );
    });

    test('renders suggestion message', () => {
      const correctionMessage = renderResult.getByText('Did you mean:');
      expect(correctionMessage).toBeDefined();
    });

    test('renders spelling suggestion', () => {
      const spellingCorrection = renderResult.getByText('cunningham');
      expect(spellingCorrection).toBeDefined();
    });

    describe('clicking on suggestion', () => {
      beforeEach(() => {
        const spellingCorrection = renderResult.getByText('cunningham');
        fireEvent.click(spellingCorrection);
      });

      test('calls performSearch', () => {
        expect(performSearchMock).toBeCalledWith(
          expect.objectContaining({
            naturalLanguageQuery: 'cunningham',
            filter: '',
            offset: 0
          })
        );
        // tests exposed onChange function
        expect(onChangeMock).toBeCalledWith('cunningham');
      });
    });
  });
});
