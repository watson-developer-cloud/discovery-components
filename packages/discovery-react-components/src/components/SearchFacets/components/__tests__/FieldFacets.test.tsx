import * as React from 'react';
import { render, fireEvent, RenderResult } from '@testing-library/react';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
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
  fieldFacetsComponent: RenderResult;
}

interface SetupConfig {
  filter: string;
  componentSettingsAggregations: DiscoveryV2.ComponentSettingsAggregation[];
  collapsedFacetsCount: number;
  aggregationResults: DiscoveryV2.QueryAggregation[] | undefined;
}

const aggregationComponentSettings: DiscoveryV2.ComponentSettingsAggregation[] = [
  {
    name: 'author_id',
    label: 'Writers',
    multiple_selections_allowed: true
  },
  {
    name: 'subject_id',
    label: 'Topics',
    multiple_selections_allowed: true
  }
];

const defaultSetupConfig: SetupConfig = {
  filter: '',
  componentSettingsAggregations: aggregationComponentSettings,
  collapsedFacetsCount: 5,
  aggregationResults: weirdFacetsQueryResponse.result.aggregations
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
    aggregationResults: mergedSetupConfig.aggregationResults,
    searchResponseStore: {
      ...searchResponseStoreDefaults,
      parameters: {
        projectId: '',
        filter: mergedSetupConfig.filter
      }
    },
    componentSettings: {
      aggregations: mergedSetupConfig.componentSettingsAggregations
    }
  };
  const api: Partial<SearchApiIFC> = {
    performSearch: performSearchMock
  };
  const fieldFacetsComponent = render(
    wrapWithContext(
      <SearchFacets
        collapsedFacetsCount={mergedSetupConfig.collapsedFacetsCount}
        overrideComponentSettingsAggregations={mergedSetupConfig.componentSettingsAggregations}
      />,
      api,
      context
    )
  );
  return {
    performSearchMock,
    fieldFacetsComponent
  };
};

describe('FilterFacetsComponent', () => {
  describe('legend header elements', () => {
    test('contains first facet header with author field text', () => {
      const { fieldFacetsComponent } = setup();
      const headerAuthorField = fieldFacetsComponent.getByText('Writers');
      expect(headerAuthorField).toBeDefined();
    });

    test('contains second facet header with subject field text', () => {
      const { fieldFacetsComponent } = setup();
      const headerSubjectField = fieldFacetsComponent.getByText('Topics');
      expect(headerSubjectField).toBeDefined();
    });

    describe('when componentSettings and aggregations are different', () => {
      let setupResult: Setup;
      const termAgg = {
        type: 'term',
        name: 'one',
        field: 'foo',
        results: [
          {
            key: 'hi',
            matching_results: 1
          }
        ]
      };
      const termAgg2 = { ...termAgg, name: 'two' };
      beforeEach(() => {
        setupResult = setup({
          aggregationResults: [termAgg2, termAgg],
          componentSettingsAggregations: [
            {
              name: 'one',
              label: 'First'
            },
            {
              name: 'two',
              label: 'Second'
            }
          ]
        });
      });

      test('should match labels by name', () => {
        const { fieldFacetsComponent } = setupResult;
        const facetLegends = [].slice
          .call(fieldFacetsComponent.container.querySelectorAll('legend'))
          .map((legend: HTMLLegendElement) => legend.textContent);

        expect(facetLegends).toHaveLength(2);
        expect(facetLegends[0]).toEqual('Second');
        expect(facetLegends[1]).toEqual('First');
      });
    });
  });

  describe('checkbox elements', () => {
    test('contains first facet checkboxes with correct labels', () => {
      const { fieldFacetsComponent } = setup();
      const ABMNStaffCheckbox = fieldFacetsComponent.getByLabelText('ABMN Staff');
      const newsStaffCheckbox = fieldFacetsComponent.getByLabelText('News Staff');
      const editorCheckbox = fieldFacetsComponent.getByLabelText('editor');
      expect(ABMNStaffCheckbox).toBeDefined();
      expect(newsStaffCheckbox).toBeDefined();
      expect(editorCheckbox).toBeDefined();
    });

    test('contains second facet checkboxes with correct labels', () => {
      const { fieldFacetsComponent } = setup();
      const animalsCheckbox = fieldFacetsComponent.getByLabelText('Animals');
      const peopleCheckbox = fieldFacetsComponent.getByLabelText('People');
      const placesCheckbox = fieldFacetsComponent.getByLabelText('Places');
      const thingsCheckbox = fieldFacetsComponent.getByLabelText('Things');
      expect(animalsCheckbox).toBeDefined();
      expect(peopleCheckbox).toBeDefined();
      expect(placesCheckbox).toBeDefined();
      expect(thingsCheckbox).toBeDefined();
    });

    test('checkboxes are unchecked when initially rendered', () => {
      const { fieldFacetsComponent } = setup();
      const animalsCheckbox = fieldFacetsComponent.getByLabelText('Animals');
      expect(animalsCheckbox['checked']).toEqual(false);
    });

    test('checkboxes are checked when set in filter query', () => {
      const { fieldFacetsComponent } = setup({ filter: 'subject:Animals' });
      const animalsCheckbox = fieldFacetsComponent.getByLabelText('Animals');
      expect(animalsCheckbox['checked']).toEqual(true);
    });
  });

  describe('checkboxes apply filters', () => {
    test('it adds correct filter when one checkbox within single facet is checked', () => {
      const { fieldFacetsComponent, performSearchMock } = setup();
      const animalsCheckbox = fieldFacetsComponent.getByLabelText('Animals');
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
      const { fieldFacetsComponent, performSearchMock } = setup({
        collapsedFacetsCount: 10
      });
      const animalsCheckbox = fieldFacetsComponent.getByLabelText('This | that');
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
      const { fieldFacetsComponent, performSearchMock } = setup({
        collapsedFacetsCount: 10
      });
      const animalsCheckbox = fieldFacetsComponent.getByLabelText('hey, you');
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
      const { fieldFacetsComponent, performSearchMock } = setup({
        collapsedFacetsCount: 10
      });
      const animalsCheckbox = fieldFacetsComponent.getByLabelText('something: else');
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

    test('it adds correct filters when second checkbox within single facet is checked', () => {
      const { fieldFacetsComponent, performSearchMock } = setup({ filter: 'subject:Animals' });
      const peopleCheckbox = fieldFacetsComponent.getByLabelText('People');
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

    test('it adds correct filter when checkboxes from multiple facets are checked', () => {
      const { fieldFacetsComponent, performSearchMock } = setup({
        filter: 'subject:"Animals"'
      });
      const newsStaffCheckbox = fieldFacetsComponent.getByLabelText('News Staff');
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

    test('maintains the same order of checkboxes before and after selection', () => {
      const { fieldFacetsComponent } = setup();
      const expectedLabels = [
        'ABMN Staff',
        'News Staff',
        'editor',
        'Animals',
        'People',
        'Places',
        'Things',
        'This | that'
      ];
      const beforeLabels = [].slice.call(fieldFacetsComponent.container.querySelectorAll('label'));
      expect(beforeLabels.map((label: HTMLLabelElement) => label.textContent)).toEqual(
        expectedLabels
      );

      const newsStaffCheckbox = fieldFacetsComponent.getByLabelText('News Staff');
      fireEvent.click(newsStaffCheckbox);

      const afterLabels = [].slice.call(fieldFacetsComponent.container.querySelectorAll('label'));
      expect(afterLabels.map((label: HTMLLabelElement) => label.textContent)).toEqual(
        expectedLabels
      );
    });

    describe('when multiple facets use the same field', () => {
      let setupResult: Setup;
      const termAgg = {
        type: 'term',
        name: 'first',
        field: 'foo',
        results: [
          {
            key: 'two',
            matching_results: 2
          },
          {
            key: 'one',
            matching_results: 1
          }
        ]
      };
      const termAgg2 = { ...termAgg, name: 'second' };

      beforeEach(() => {
        setupResult = setup({ aggregationResults: [termAgg, termAgg2], filter: 'foo:two' });
      });

      test('should only deselect one of the two', () => {
        const { fieldFacetsComponent } = setupResult;
        const checkboxes = fieldFacetsComponent.getAllByLabelText('two');
        expect(checkboxes).toHaveLength(2);
        expect(checkboxes[0]['checked']).toEqual(true);
        expect(checkboxes[1]['checked']).toEqual(false);

        fireEvent.click(checkboxes[1]);
        expect(checkboxes[0]['checked']).toEqual(true);
        expect(checkboxes[1]['checked']).toEqual(true);
      });
    });
  });

  describe('when component aggregations are different from aggregations on the same field', () => {
    let setupResult: Setup;
    beforeEach(() => {
      const componentSettingsAggregations = [
        {
          name: 'blah',
          label: 'BLAAH',
          multiple_selections_allowed: true
        },
        {
          name: 'junk',
          label: 'JUUNK',
          multiple_selections_allowed: true
        }
      ];

      const aggregationResults = [
        {
          type: 'term',
          name: 'junk',
          field: 'foo',
          results: [
            {
              key: 'hi',
              matching_results: 1
            }
          ]
        },
        {
          type: 'term',
          name: 'pop',
          field: 'foo',
          results: [
            {
              key: 'hi',
              matching_results: 1
            }
          ]
        }
      ];
      const filter = 'foo:"hi"';
      setupResult = setup({ componentSettingsAggregations, aggregationResults, filter });
    });

    test('should only select one of the two', () => {
      const { fieldFacetsComponent } = setupResult;
      const checkboxes = fieldFacetsComponent.getAllByLabelText('hi');
      expect(checkboxes).toHaveLength(2);
      expect(checkboxes[0]['checked']).toEqual(true);
      expect(checkboxes[1]['checked']).toEqual(false);
    });
  });

  describe('checkboxes remove filters', () => {
    test('it removes correct filter when checkbox within single facet is unchecked', () => {
      const { fieldFacetsComponent, performSearchMock } = setup({ filter: 'subject:Animals' });
      const animalsCheckbox = fieldFacetsComponent.getByLabelText('Animals');
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
        const { fieldFacetsComponent } = setupData;
        expect(fieldFacetsComponent.queryAllByTitle('Clear all selected items')).toHaveLength(0);
      });
    });

    describe('when 1 selection is made', () => {
      beforeEach(() => {
        setupData = setup({ filter: 'author:"ABMN Staff"' });
      });

      test('the clear button appears once', () => {
        const { fieldFacetsComponent } = setupData;
        expect(fieldFacetsComponent.queryAllByTitle('Clear all selected items')).toHaveLength(1);
      });

      describe('and the clear button is clicked', () => {
        beforeEach(() => {
          const { fieldFacetsComponent } = setupData;
          const clearButton = fieldFacetsComponent.getByTitle('Clear all selected items');
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
        const { fieldFacetsComponent } = setupData;
        expect(fieldFacetsComponent.queryAllByTitle('Clear all selected items')).toHaveLength(1);
      });

      describe('and the clear button is clicked', () => {
        beforeEach(() => {
          const { fieldFacetsComponent } = setupData;
          const clearButton = fieldFacetsComponent.getByTitle('Clear all selected items');
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
        const { fieldFacetsComponent } = setupData;
        expect(fieldFacetsComponent.queryAllByTitle('Clear all selected items')).toHaveLength(2);
      });

      describe('and the first clear button is clicked', () => {
        beforeEach(() => {
          const { fieldFacetsComponent } = setupData;
          const clearButtons = fieldFacetsComponent.queryAllByTitle('Clear all selected items');
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
      const { fieldFacetsComponent } = setup({
        filter: 'subject:Animals',
        componentSettingsAggregations: updateSelectionSettings(['subject_id'])
      });
      const animalRadioButton = fieldFacetsComponent.getAllByLabelText('Animals');
      expect(animalRadioButton[0]['checked']).toEqual(true);
    });

    test('it only allows one element selected at a time', () => {
      const { fieldFacetsComponent, performSearchMock } = setup({
        componentSettingsAggregations: updateSelectionSettings(['subject_id'])
      });
      //Carbon uses a Label element that also has @aria-label, which matches twice
      const animalRadioButton = fieldFacetsComponent.getAllByLabelText('Animals');
      fireEvent.click(animalRadioButton[0]);
      performSearchMock.mockReset();
      const peopleRadioButton = fieldFacetsComponent.getAllByLabelText('People');
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
      const { fieldFacetsComponent, performSearchMock } = setup({
        componentSettingsAggregations: updateSelectionSettings(['subject_id'])
      });
      //Carbon uses a Label element that also has @aria-label, which matches twice
      const animalRadioButton = fieldFacetsComponent.getAllByLabelText('Animals');
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
      const { fieldFacetsComponent, performSearchMock } = setup({
        componentSettingsAggregations: updateSelectionSettings(['subject_id'])
      });
      //Carbon uses a Label element that also has @aria-label, which matches twice
      const animalRadioButton = fieldFacetsComponent.getAllByLabelText('Animals');
      fireEvent.click(animalRadioButton[0]);

      const ABMNStaffCheckbox = fieldFacetsComponent.getByLabelText('ABMN Staff');
      fireEvent.click(ABMNStaffCheckbox);

      const newsStaffCheckbox = fieldFacetsComponent.getByLabelText('News Staff');
      fireEvent.click(newsStaffCheckbox);

      performSearchMock.mockReset();
      const peopleRadioButton = fieldFacetsComponent.getAllByLabelText('People');
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
      const { fieldFacetsComponent, performSearchMock } = setup({
        componentSettingsAggregations: updateSelectionSettings(['author_id', 'subject_id'])
      });
      //Carbon uses a Label element that also has @aria-label, which matches twice
      const animalRadioButton = fieldFacetsComponent.getAllByLabelText('Animals');
      fireEvent.click(animalRadioButton[0]);

      const ABMNStaffRadioButton = fieldFacetsComponent.getAllByLabelText('ABMN Staff');
      fireEvent.click(ABMNStaffRadioButton[0]);

      const newsStaffRadioButton = fieldFacetsComponent.getAllByLabelText('News Staff');
      fireEvent.click(newsStaffRadioButton[0]);

      performSearchMock.mockReset();
      const peopleRadioButton = fieldFacetsComponent.getAllByLabelText('People');
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
