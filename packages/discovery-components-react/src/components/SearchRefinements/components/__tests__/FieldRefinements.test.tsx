import * as React from 'react';
import { render, fireEvent, RenderResult } from '@testing-library/react';
import DiscoveryV2 from '@disco-widgets/ibm-watson/discovery/v2';
import { wrapWithContext } from '../../../../utils/testingUtils';
import { SearchContextIFC, SearchApiIFC } from '../../../DiscoverySearch/DiscoverySearch';
import { SearchRefinements } from '../../SearchRefinements';
import { weirdRefinementsQueryResponse } from '../../__fixtures__/refinementsQueryResponse';

interface Setup {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  performSearchMock: jest.Mock<any, any>;
  fieldRefinementsComponent: RenderResult;
}

interface SetupConfig {
  filter: string;
  componentSettingsAggregations: DiscoveryV2.ComponentSettingsAggregation[];
  collapsedRefinementsCount: number;
}

const aggregationComponentSettings: DiscoveryV2.ComponentSettingsAggregation[] = [
  {
    name: 'author',
    label: 'Writers',
    multiple_selections_allowed: true
  },
  {
    name: 'subject',
    label: 'Topics',
    multiple_selections_allowed: true
  }
];

const defaultSetupConfig: SetupConfig = {
  filter: '',
  componentSettingsAggregations: aggregationComponentSettings,
  collapsedRefinementsCount: 5
};

const updateSelectionSettings = (
  singleSelectFields: string[]
): DiscoveryV2.ComponentSettingsAggregation[] => {
  return aggregationComponentSettings.map(setting => {
    return setting.name && singleSelectFields.includes(setting.name)
      ? Object.assign({}, setting, { multiple_selections_allowed: false })
      : setting;
  });
};

const setup = (setupConfig: Partial<SetupConfig> = {}): Setup => {
  const mergedSetupConfig = { ...defaultSetupConfig, ...setupConfig };
  const performSearchMock = jest.fn();
  const context: Partial<SearchContextIFC> = {
    aggregationResults: weirdRefinementsQueryResponse.result.aggregations,
    searchParameters: {
      projectId: '',
      filter: mergedSetupConfig.filter
    },
    componentSettings: {
      aggregations: mergedSetupConfig.componentSettingsAggregations
    }
  };
  const api: Partial<SearchApiIFC> = {
    performSearch: performSearchMock
  };
  const fieldRefinementsComponent = render(
    wrapWithContext(
      <SearchRefinements
        collapsedRefinementsCount={mergedSetupConfig.collapsedRefinementsCount}
        overrideComponentSettingsAggregations={mergedSetupConfig.componentSettingsAggregations}
      />,
      api,
      context
    )
  );
  return {
    performSearchMock,
    fieldRefinementsComponent
  };
};

describe('FilterRefinementsComponent', () => {
  describe('legend header elements', () => {
    test('contains first refinement header with author field text', () => {
      const { fieldRefinementsComponent } = setup();
      const headerAuthorField = fieldRefinementsComponent.getByText('Writers');
      expect(headerAuthorField).toBeDefined();
    });

    test('contains second refinement header with subject field text', () => {
      const { fieldRefinementsComponent } = setup();
      const headerSubjectField = fieldRefinementsComponent.getByText('Topics');
      expect(headerSubjectField).toBeDefined();
    });
  });

  describe('checkbox elements', () => {
    test('contains first refinement checkboxes with correct labels', () => {
      const { fieldRefinementsComponent } = setup();
      const ABMNStaffCheckbox = fieldRefinementsComponent.getByLabelText('ABMN Staff');
      const newsStaffCheckbox = fieldRefinementsComponent.getByLabelText('News Staff');
      const editorCheckbox = fieldRefinementsComponent.getByLabelText('editor');
      expect(ABMNStaffCheckbox).toBeDefined();
      expect(newsStaffCheckbox).toBeDefined();
      expect(editorCheckbox).toBeDefined();
    });

    test('contains second refinement checkboxes with correct labels', () => {
      const { fieldRefinementsComponent } = setup();
      const animalsCheckbox = fieldRefinementsComponent.getByLabelText('Animals');
      const peopleCheckbox = fieldRefinementsComponent.getByLabelText('People');
      const placesCheckbox = fieldRefinementsComponent.getByLabelText('Places');
      const thingsCheckbox = fieldRefinementsComponent.getByLabelText('Things');
      expect(animalsCheckbox).toBeDefined();
      expect(peopleCheckbox).toBeDefined();
      expect(placesCheckbox).toBeDefined();
      expect(thingsCheckbox).toBeDefined();
    });

    test('checkboxes are unchecked when initially rendered', () => {
      const { fieldRefinementsComponent } = setup();
      const animalsCheckbox = fieldRefinementsComponent.getByLabelText('Animals');
      expect(animalsCheckbox['checked']).toEqual(false);
    });

    test('checkboxes are checked when set in filter query', () => {
      const { fieldRefinementsComponent } = setup({ filter: 'subject:Animals' });
      const animalsCheckbox = fieldRefinementsComponent.getByLabelText('Animals');
      expect(animalsCheckbox['checked']).toEqual(true);
    });
  });

  describe('checkboxes apply filters', () => {
    test('it adds correct filter when one checkbox within single refinement is checked', () => {
      const { fieldRefinementsComponent, performSearchMock } = setup();
      const animalsCheckbox = fieldRefinementsComponent.getByLabelText('Animals');
      performSearchMock.mockReset();
      fireEvent.click(animalsCheckbox);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: 'subject:"Animals"'
        }),
        false
      );
    });

    test('it adds correct filter when aggregation contains `|`', () => {
      const { fieldRefinementsComponent, performSearchMock } = setup({
        collapsedRefinementsCount: 10
      });
      const animalsCheckbox = fieldRefinementsComponent.getByLabelText('This | that');
      performSearchMock.mockReset();
      fireEvent.click(animalsCheckbox);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: 'subject:"This | that"'
        }),
        false
      );
    });

    test('it adds correct filter when aggregation contains `,`', () => {
      const { fieldRefinementsComponent, performSearchMock } = setup({
        collapsedRefinementsCount: 10
      });
      const animalsCheckbox = fieldRefinementsComponent.getByLabelText('hey, you');
      performSearchMock.mockReset();
      fireEvent.click(animalsCheckbox);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: 'subject:"hey, you"'
        }),
        false
      );
    });

    test('it adds correct filter when aggregation contains `:`', () => {
      const { fieldRefinementsComponent, performSearchMock } = setup();
      const animalsCheckbox = fieldRefinementsComponent.getByLabelText('something: else');
      performSearchMock.mockReset();
      fireEvent.click(animalsCheckbox);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: 'subject:"something: else"'
        }),
        false
      );
    });

    test('it adds correct filters when second checkbox within single refinement is checked', () => {
      const { fieldRefinementsComponent, performSearchMock } = setup({ filter: 'subject:Animals' });
      const peopleCheckbox = fieldRefinementsComponent.getByLabelText('People');
      performSearchMock.mockReset();
      fireEvent.click(peopleCheckbox);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: 'subject:"Animals"|"People"'
        }),
        false
      );
    });

    test('it adds correct filter when checkboxes from multiple refinements are checked', () => {
      const { fieldRefinementsComponent, performSearchMock } = setup({
        filter: 'subject:"Animals"'
      });
      const newsStaffCheckbox = fieldRefinementsComponent.getByLabelText('News Staff');
      performSearchMock.mockReset();
      fireEvent.click(newsStaffCheckbox);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: 'author:"News Staff",subject:"Animals"'
        }),
        false
      );
    });
  });

  describe('checkboxes remove filters', () => {
    test('it removes correct filter when checkbox within single refinement is unchecked', () => {
      const { fieldRefinementsComponent, performSearchMock } = setup({ filter: 'subject:Animals' });
      const animalsCheckbox = fieldRefinementsComponent.getByLabelText('Animals');
      performSearchMock.mockReset();
      fireEvent.click(animalsCheckbox);
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

  describe('clear all button', () => {
    let setupData: Setup;

    describe('when no selections are made', () => {
      beforeEach(() => {
        setupData = setup();
      });

      test('the clear button does not appear', () => {
        const { fieldRefinementsComponent } = setupData;
        expect(fieldRefinementsComponent.queryAllByTitle('Clear all selected items')).toHaveLength(
          0
        );
      });
    });

    describe('when 1 selection is made', () => {
      beforeEach(() => {
        setupData = setup({ filter: 'author:"ABMN Staff"' });
      });

      test('the clear button appears once', () => {
        const { fieldRefinementsComponent } = setupData;
        expect(fieldRefinementsComponent.queryAllByTitle('Clear all selected items')).toHaveLength(
          1
        );
      });

      describe('and the clear button is clicked', () => {
        beforeEach(() => {
          const { fieldRefinementsComponent } = setupData;
          const clearButton = fieldRefinementsComponent.getByTitle('Clear all selected items');
          fireEvent.click(clearButton);
        });

        test('calls performSearch with filters removed', () => {
          const { performSearchMock } = setupData;
          expect(performSearchMock).toHaveBeenCalledWith(
            expect.objectContaining({
              filter: '',
              offset: 0
            }),
            false
          );
        });
      });
    });

    describe('when 2 selections are made in the same category', () => {
      beforeEach(() => {
        setupData = setup({ filter: 'author:"ABMN Staff"|"News Staff"' });
      });

      test('the clear button appears once', () => {
        const { fieldRefinementsComponent } = setupData;
        expect(fieldRefinementsComponent.queryAllByTitle('Clear all selected items')).toHaveLength(
          1
        );
      });

      describe('and the clear button is clicked', () => {
        beforeEach(() => {
          const { fieldRefinementsComponent } = setupData;
          const clearButton = fieldRefinementsComponent.getByTitle('Clear all selected items');
          fireEvent.click(clearButton);
        });

        test('calls performSearch with filters removed', () => {
          const { performSearchMock } = setupData;
          expect(performSearchMock).toHaveBeenCalledWith(
            expect.objectContaining({
              filter: '',
              offset: 0
            }),
            false
          );
        });
      });
    });

    describe('when 2 selections are made in different categories', () => {
      beforeEach(() => {
        setupData = setup({ filter: 'author:"ABMN Staff",subject:"Animals"' });
      });

      test('the clear button appears twice', () => {
        const { fieldRefinementsComponent } = setupData;
        expect(fieldRefinementsComponent.queryAllByTitle('Clear all selected items')).toHaveLength(
          2
        );
      });

      describe('and the first clear button is clicked', () => {
        beforeEach(() => {
          const { fieldRefinementsComponent } = setupData;
          const clearButtons = fieldRefinementsComponent.queryAllByTitle(
            'Clear all selected items'
          );
          fireEvent.click(clearButtons[0]);
        });

        test('calls performSearch with filters removed', () => {
          const { performSearchMock } = setupData;
          expect(performSearchMock).toHaveBeenCalledWith(
            expect.objectContaining({
              filter: 'subject:"Animals"',
              offset: 0
            }),
            false
          );
        });
      });
    });
  });

  describe('when multiple_selections_allowed is false', () => {
    test('radiobuttons are selected when set in filter query', () => {
      const { fieldRefinementsComponent } = setup({
        filter: 'subject:Animals',
        componentSettingsAggregations: updateSelectionSettings(['subject'])
      });
      const animalRadioButton = fieldRefinementsComponent.getAllByLabelText('Animals');
      expect(animalRadioButton[0]['checked']).toEqual(true);
    });

    test('it only allows one element selected at a time', () => {
      const { fieldRefinementsComponent, performSearchMock } = setup({
        componentSettingsAggregations: updateSelectionSettings(['subject'])
      });
      //Carbon uses a Label element that also has @aria-label, which matches twice
      const animalRadioButton = fieldRefinementsComponent.getAllByLabelText('Animals');
      fireEvent.click(animalRadioButton[0]);
      performSearchMock.mockReset();
      const peopleRadioButton = fieldRefinementsComponent.getAllByLabelText('People');
      fireEvent.click(peopleRadioButton[0]);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: 'subject:"People"',
          offset: 0
        }),
        false
      );
    });

    test('it allows unselecting term', () => {
      const { fieldRefinementsComponent, performSearchMock } = setup({
        componentSettingsAggregations: updateSelectionSettings(['subject'])
      });
      //Carbon uses a Label element that also has @aria-label, which matches twice
      const animalRadioButton = fieldRefinementsComponent.getAllByLabelText('Animals');
      fireEvent.click(animalRadioButton[0]);
      performSearchMock.mockReset();
      fireEvent.click(animalRadioButton[0]);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: '',
          offset: 0
        }),
        false
      );
    });

    test('it allows other fields to still be multiselect', () => {
      const { fieldRefinementsComponent, performSearchMock } = setup({
        componentSettingsAggregations: updateSelectionSettings(['subject'])
      });
      //Carbon uses a Label element that also has @aria-label, which matches twice
      const animalRadioButton = fieldRefinementsComponent.getAllByLabelText('Animals');
      fireEvent.click(animalRadioButton[0]);

      const ABMNStaffCheckbox = fieldRefinementsComponent.getByLabelText('ABMN Staff');
      fireEvent.click(ABMNStaffCheckbox);

      const newsStaffCheckbox = fieldRefinementsComponent.getByLabelText('News Staff');
      fireEvent.click(newsStaffCheckbox);

      performSearchMock.mockReset();
      const peopleRadioButton = fieldRefinementsComponent.getAllByLabelText('People');
      fireEvent.click(peopleRadioButton[0]);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: 'author:"ABMN Staff"|"News Staff",subject:"People"',
          offset: 0
        }),
        false
      );
    });

    test('it handles multiple, single select fields', () => {
      const { fieldRefinementsComponent, performSearchMock } = setup({
        componentSettingsAggregations: updateSelectionSettings(['author', 'subject'])
      });
      //Carbon uses a Label element that also has @aria-label, which matches twice
      const animalRadioButton = fieldRefinementsComponent.getAllByLabelText('Animals');
      fireEvent.click(animalRadioButton[0]);

      const ABMNStaffRadioButton = fieldRefinementsComponent.getAllByLabelText('ABMN Staff');
      fireEvent.click(ABMNStaffRadioButton[0]);

      const newsStaffRadioButton = fieldRefinementsComponent.getAllByLabelText('News Staff');
      fireEvent.click(newsStaffRadioButton[0]);

      performSearchMock.mockReset();
      const peopleRadioButton = fieldRefinementsComponent.getAllByLabelText('People');
      fireEvent.click(peopleRadioButton[0]);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: 'author:"News Staff",subject:"People"',
          offset: 0
        }),
        false
      );
    });
  });
});
