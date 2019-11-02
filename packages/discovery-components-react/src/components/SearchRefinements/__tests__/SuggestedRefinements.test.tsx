import * as React from 'react';
import { render, fireEvent, RenderResult } from '@testing-library/react';
import { wrapWithContext } from '../../../utils/testingUtils';
import { SearchContextIFC, SearchApiIFC } from '../../DiscoverySearch/DiscoverySearch';
import { SearchRefinements } from '../SearchRefinements';
import { weirdRefinementsQueryResponse } from '../fixtures/refinementsQueryResponse';

interface Setup {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  performSearchMock: jest.Mock<any, any>;
  refinementsComponent: RenderResult;
}

const setup = (filter: string): Setup => {
  const performSearchMock = jest.fn();
  const context: Partial<SearchContextIFC> = {
    aggregationResults: weirdRefinementsQueryResponse.result.aggregations,
    searchResponse: {
      suggested_refinements: weirdRefinementsQueryResponse.result.suggested_refinements
    },
    searchParameters: {
      projectId: '',
      filter: filter,
      aggregation: '[term(author,count:3),term(subject,count:4)]'
    }
  };
  const api: Partial<SearchApiIFC> = {
    performSearch: performSearchMock
  };
  const refinementsComponent = render(
    wrapWithContext(<SearchRefinements showSuggestedRefinements={true} />, api, context)
  );
  return {
    performSearchMock,
    refinementsComponent
  };
};

describe('SuggestedRefinementsComponent', () => {
  describe('legend header elements', () => {
    test('contains placeholder text', () => {
      const { refinementsComponent } = setup('');
      const headerAuthorField = refinementsComponent.getByText('Suggested Enrichments');
      expect(headerAuthorField).toBeDefined();
    });
  });

  describe('checkbox elements', () => {
    test('contains refinement checkboxes with correct labels', () => {
      const { refinementsComponent } = setup('');
      const embiidCheckbox = refinementsComponent.getByLabelText('trust the process');
      const saviorCheckbox = refinementsComponent.getByLabelText('sam hinkie');
      const colonCheckbox = refinementsComponent.getByLabelText('this: is');
      const commaCheckbox = refinementsComponent.getByLabelText('bogus, strings');
      const pipeCheckbox = refinementsComponent.getByLabelText('maybe | not');
      expect(embiidCheckbox).toBeDefined();
      expect(saviorCheckbox).toBeDefined();
      expect(colonCheckbox).toBeDefined();
      expect(commaCheckbox).toBeDefined();
      expect(pipeCheckbox).toBeDefined();
    });

    test('checkboxes are unchecked when initially rendered', () => {
      const { refinementsComponent } = setup('');
      const embiidCheckbox = refinementsComponent.getByLabelText('trust the process');
      expect(embiidCheckbox['checked']).toEqual(false);
    });

    test('checkboxes are checked when set in filter query', () => {
      const { refinementsComponent } = setup('"sam hinkie"');
      const saviorCheckbox = refinementsComponent.getByLabelText('sam hinkie');
      expect(saviorCheckbox['checked']).toEqual(true);
    });
  });

  describe('clear all button', () => {
    let setupData: Setup;

    describe('when no selections are made', () => {
      beforeEach(() => {
        setupData = setup('');
      });

      test('the clear button does not appear', () => {
        const { refinementsComponent } = setupData;
        expect(refinementsComponent.queryAllByTitle('Clear all selected items')).toHaveLength(0);
      });
    });

    describe('when 1 selection is made', () => {
      beforeEach(() => {
        setupData = setup('"trust the process"');
      });

      test('the clear button appears once', () => {
        const { refinementsComponent } = setupData;
        expect(refinementsComponent.queryAllByTitle('Clear all selected items')).toHaveLength(1);
      });

      describe('and the clear button is clicked', () => {
        beforeEach(() => {
          const { refinementsComponent } = setupData;
          const clearButton = refinementsComponent.getByTitle('Clear all selected items');
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
        setupData = setup('"trust the process","just not the electrician"');
      });

      test('the clear button appears once', () => {
        const { refinementsComponent } = setupData;
        expect(refinementsComponent.queryAllByTitle('Clear all selected items')).toHaveLength(1);
      });

      describe('and the clear button is clicked', () => {
        beforeEach(() => {
          const { refinementsComponent } = setupData;
          const clearButton = refinementsComponent.getByTitle('Clear all selected items');
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
      const { refinementsComponent, performSearchMock } = setup('');
      const embiidCheckbox = refinementsComponent.getByLabelText('trust the process');
      performSearchMock.mockReset();
      fireEvent.click(embiidCheckbox);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: '"trust the process"'
        }),
        false
      );
    });

    test('it adds correct filter when aggregation contains `|`', () => {
      const { refinementsComponent, performSearchMock } = setup('');
      const pipeCheckbox = refinementsComponent.getByLabelText('maybe | not');
      performSearchMock.mockReset();
      fireEvent.click(pipeCheckbox);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: '"maybe | not"'
        }),
        false
      );
    });

    test('it adds correct filter when aggregation contains `,`', () => {
      const { refinementsComponent, performSearchMock } = setup('');
      const commaCheckbox = refinementsComponent.getByLabelText('bogus, strings');
      performSearchMock.mockReset();
      fireEvent.click(commaCheckbox);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: '"bogus, strings"'
        }),
        false
      );
    });

    test('it adds correct filter when aggregation contains `:`', () => {
      const { refinementsComponent, performSearchMock } = setup('');
      const colonCheckbox = refinementsComponent.getByLabelText('this: is');
      performSearchMock.mockReset();
      fireEvent.click(colonCheckbox);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: '"this: is"'
        }),
        false
      );
    });

    test('it adds correct filters when second checkbox is checked', () => {
      const { refinementsComponent, performSearchMock } = setup('"sam hinkie"');
      const embiidCheckbox = refinementsComponent.getByLabelText('trust the process');
      performSearchMock.mockReset();
      fireEvent.click(embiidCheckbox);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: '"sam hinkie","trust the process"'
        }),
        false
      );
    });
  });

  describe('checkboxes remove filters', () => {
    test('it removes correct filter when checkbox within single refinement is unchecked', () => {
      const { refinementsComponent, performSearchMock } = setup('"sam hinkie"');
      const saviorCheckbox = refinementsComponent.getByLabelText('sam hinkie');
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
    });
  });
});
