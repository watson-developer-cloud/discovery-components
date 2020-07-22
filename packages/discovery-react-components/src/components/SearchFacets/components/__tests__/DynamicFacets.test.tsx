import * as React from 'react';
import { render, fireEvent, RenderResult } from '@testing-library/react';
import { wrapWithContext } from 'utils/testingUtils';
import {
  SearchContextIFC,
  SearchApiIFC,
  searchResponseStoreDefaults
} from 'components/DiscoverySearch/DiscoverySearch';
import SearchFacets from 'components/SearchFacets/SearchFacets';
import { weirdFacetsQueryResponse } from 'components/SearchFacets/__fixtures__/facetsQueryResponse';

interface Setup {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  performSearchMock: jest.Mock<any, any>;
  onChangeMock: jest.Mock;
  searchFacetsComponent: RenderResult;
}

interface SetupConfig {
  filter: string;
  collapsedFacetsCount: number;
}

const defaultSetupConfig: SetupConfig = {
  filter: '',
  collapsedFacetsCount: 5
};

const setup = (setupConfig: Partial<SetupConfig> = {}): Setup => {
  const mergedSetupConfig = { ...defaultSetupConfig, ...setupConfig };
  const performSearchMock = jest.fn();
  const onChangeMock = jest.fn();
  const context: Partial<SearchContextIFC> = {
    aggregationResults: weirdFacetsQueryResponse.result.aggregations,
    searchResponseStore: {
      ...searchResponseStoreDefaults,
      parameters: {
        projectId: '',
        aggregation: '[term(author,count:3),term(subject,count:4)]',
        filter: mergedSetupConfig.filter
      },
      data: {
        suggested_refinements: weirdFacetsQueryResponse.result.suggested_refinements
      }
    }
  };
  const api: Partial<SearchApiIFC> = {
    performSearch: performSearchMock
  };
  const searchFacetsComponent = render(
    wrapWithContext(
      <SearchFacets
        collapsedFacetsCount={mergedSetupConfig.collapsedFacetsCount}
        onChange={onChangeMock}
      />,
      api,
      context
    )
  );
  return {
    performSearchMock,
    onChangeMock,
    searchFacetsComponent
  };
};

describe('DynamicFacetsComponent', () => {
  describe('legend header elements', () => {
    test('contains placeholder text', () => {
      const { searchFacetsComponent } = setup();
      const headerAuthorField = searchFacetsComponent.getByText('Dynamic Facets');
      expect(headerAuthorField).toBeDefined();
    });
  });

  describe('checkbox elements', () => {
    test('contains facet checkboxes with correct labels', () => {
      const { searchFacetsComponent } = setup({ collapsedFacetsCount: 10 });
      const embiidCheckbox = searchFacetsComponent.getByLabelText('trust the process');
      const saviorCheckbox = searchFacetsComponent.getByLabelText('sam hinkie');
      const colonCheckbox = searchFacetsComponent.getByLabelText('this: is');
      const commaCheckbox = searchFacetsComponent.getByLabelText('bogus, strings');
      const pipeCheckbox = searchFacetsComponent.getByLabelText('maybe | not');
      expect(embiidCheckbox).toBeDefined();
      expect(saviorCheckbox).toBeDefined();
      expect(colonCheckbox).toBeDefined();
      expect(commaCheckbox).toBeDefined();
      expect(pipeCheckbox).toBeDefined();
    });

    test('checkboxes are unchecked when initially rendered', () => {
      const { searchFacetsComponent } = setup();
      const embiidCheckbox = searchFacetsComponent.getByLabelText('trust the process');
      expect(embiidCheckbox['checked']).toEqual(false);
    });

    test('checkboxes are checked when set in filter query', () => {
      const { searchFacetsComponent } = setup({ filter: '"sam hinkie"' });
      const saviorCheckbox = searchFacetsComponent.getByLabelText('sam hinkie');
      expect(saviorCheckbox['checked']).toEqual(true);
    });
  });

  describe('clear all button', () => {
    let setupData: Setup;

    describe('when no selections are made', () => {
      beforeEach(() => {
        setupData = setup();
      });

      test('the clear button does not appear', () => {
        const { searchFacetsComponent } = setupData;
        expect(searchFacetsComponent.queryAllByTitle('Clear all selected items')).toHaveLength(0);
      });
    });

    describe('when 1 selection is made', () => {
      beforeEach(() => {
        setupData = setup({ filter: '"trust the process"' });
      });

      test('the clear button appears once', () => {
        const { searchFacetsComponent } = setupData;
        expect(searchFacetsComponent.queryAllByTitle('Clear all selected items')).toHaveLength(1);
      });

      describe('and the clear button is clicked', () => {
        beforeEach(() => {
          const { searchFacetsComponent } = setupData;
          const clearButton = searchFacetsComponent.getByTitle('Clear all selected items');
          fireEvent.click(clearButton);
        });

        test('calls performSearch with filters removed', () => {
          const { performSearchMock } = setupData;
          expect(performSearchMock).toHaveBeenCalledWith(
            expect.objectContaining({
              filter: ''
            }),
            false
          );
        });
      });
    });

    describe('when 2 selections are made', () => {
      beforeEach(() => {
        setupData = setup({ filter: '"trust the process","just not the electrician"' });
      });

      test('the clear button appears once', () => {
        const { searchFacetsComponent } = setupData;
        expect(searchFacetsComponent.queryAllByTitle('Clear all selected items')).toHaveLength(1);
      });

      describe('and the clear button is clicked', () => {
        beforeEach(() => {
          const { searchFacetsComponent } = setupData;
          const clearButton = searchFacetsComponent.getByTitle('Clear all selected items');
          fireEvent.click(clearButton);
        });

        test('calls performSearch with filters removed', () => {
          const { performSearchMock } = setupData;
          expect(performSearchMock).toHaveBeenCalledWith(
            expect.objectContaining({
              filter: ''
            }),
            false
          );
        });
      });
    });
  });

  describe('checkboxes apply filters', () => {
    test('it adds correct filter when checkbox is checked', () => {
      const { searchFacetsComponent, performSearchMock, onChangeMock } = setup();
      const embiidCheckbox = searchFacetsComponent.getByLabelText('trust the process');
      performSearchMock.mockReset();
      fireEvent.click(embiidCheckbox);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: '"trust the process"'
        }),
        false
      );
      // test exposed onChange function
      expect(onChangeMock).toBeCalled();
    });

    test('it adds correct filter when aggregation contains `|`', () => {
      const { searchFacetsComponent, performSearchMock, onChangeMock } = setup({
        collapsedFacetsCount: 10
      });
      const pipeCheckbox = searchFacetsComponent.getByLabelText('maybe | not');
      performSearchMock.mockReset();
      fireEvent.click(pipeCheckbox);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: '"maybe | not"'
        }),
        false
      );
      expect(onChangeMock).toBeCalled();
    });

    test('it adds correct filter when aggregation contains `,`', () => {
      const { searchFacetsComponent, performSearchMock, onChangeMock } = setup();
      const commaCheckbox = searchFacetsComponent.getByLabelText('bogus, strings');
      performSearchMock.mockReset();
      fireEvent.click(commaCheckbox);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: '"bogus, strings"'
        }),
        false
      );
      expect(onChangeMock).toBeCalled();
    });

    test('it adds correct filter when aggregation contains `:`', () => {
      const { searchFacetsComponent, performSearchMock, onChangeMock } = setup();
      const colonCheckbox = searchFacetsComponent.getByLabelText('this: is');
      performSearchMock.mockReset();
      fireEvent.click(colonCheckbox);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: '"this: is"'
        }),
        false
      );
      expect(onChangeMock).toBeCalled();
    });

    test('it adds correct filters when second checkbox is checked', () => {
      const { searchFacetsComponent, performSearchMock, onChangeMock } = setup({
        filter: '"sam hinkie"'
      });
      const embiidCheckbox = searchFacetsComponent.getByLabelText('trust the process');
      performSearchMock.mockReset();
      fireEvent.click(embiidCheckbox);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: '"sam hinkie","trust the process"'
        }),
        false
      );
      expect(onChangeMock).toBeCalled();
    });
  });

  describe('checkboxes remove filters', () => {
    test('it removes correct filter when checkbox within single facet is unchecked', () => {
      const { searchFacetsComponent, performSearchMock, onChangeMock } = setup({
        filter: '"sam hinkie"'
      });
      const saviorCheckbox = searchFacetsComponent.getByLabelText('sam hinkie');
      performSearchMock.mockReset();
      fireEvent.click(saviorCheckbox);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: '',
          offset: 0
        }),
        false
      );
      expect(onChangeMock).toBeCalled();
    });
  });
});
