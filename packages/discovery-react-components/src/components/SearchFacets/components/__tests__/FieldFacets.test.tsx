import * as React from 'react';
import { render, fireEvent, RenderResult, waitFor, within } from '@testing-library/react';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { wrapWithContext } from 'utils/testingUtils';
import {
  SearchContextIFC,
  SearchApiIFC,
  searchResponseStoreDefaults,
  globalAggregationsResponseStoreDefaults
} from 'components/DiscoverySearch/DiscoverySearch';
import SearchFacets from 'components/SearchFacets/SearchFacets';
import {
  weirdFacetsQueryResponse,
  facetsQueryResponse,
  nestedFacetQueryResponse
} from 'components/SearchFacets/__fixtures__/facetsQueryResponse';

interface Setup {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  performSearchMock: jest.Mock<any, any>;
  onChangeMock: jest.Mock;
  fieldFacetsComponent: RenderResult;
}

interface SetupConfig {
  filter: string;
  componentSettingsAggregations: DiscoveryV2.ComponentSettingsAggregation[];
  collapsedFacetsCount: number;
  aggregationResults?: DiscoveryV2.QueryAggregation[] | null;
  showMatchingResults: boolean;
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
  aggregationResults: weirdFacetsQueryResponse.result.aggregations,
  showMatchingResults: true
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
  const onChangeMock = jest.fn();
  const context: Partial<SearchContextIFC> = {
    globalAggregationsResponseStore: {
      ...globalAggregationsResponseStoreDefaults,
      data: mergedSetupConfig.aggregationResults || []
    },
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
        showMatchingResults={mergedSetupConfig.showMatchingResults}
        onChange={onChangeMock}
      />,
      api,
      context
    )
  );
  return {
    performSearchMock,
    onChangeMock,
    fieldFacetsComponent
  };
};

describe('FieldFacetsComponent', () => {
  describe('legend header elements', () => {
    test('contains first facet header with author field text', async () => {
      const { fieldFacetsComponent } = setup();
      const headerAuthorField = await fieldFacetsComponent.findByText('Writers');
      expect(headerAuthorField).toBeInTheDocument();
    });

    test('contains second facet header with subject field text', async () => {
      const { fieldFacetsComponent } = setup();
      const headerSubjectField = await fieldFacetsComponent.findByText('Topics');
      expect(headerSubjectField).toBeInTheDocument();
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
      beforeEach(async () => {
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
        // wait for component to finish rendering (prevent "act" warning)
        await waitFor(() => {
          expect(setupResult.fieldFacetsComponent).toBeDefined();
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
    test('contains first facet checkboxes with correct labels', async () => {
      const { fieldFacetsComponent } = setup();
      const ABMNStaffCheckbox = await fieldFacetsComponent.findByLabelText('ABMN Staff (138993)');
      const newsStaffCheckbox = fieldFacetsComponent.getByLabelText('News Staff (57158)');
      const editorCheckbox = fieldFacetsComponent.getByLabelText('editor (32444)');
      expect(ABMNStaffCheckbox).toBeInTheDocument();
      expect(newsStaffCheckbox).toBeInTheDocument();
      expect(editorCheckbox).toBeInTheDocument();
    });

    test('contains second facet checkboxes with correct labels', async () => {
      const { fieldFacetsComponent } = setup();
      const animalsCheckbox = await fieldFacetsComponent.findByLabelText('Animals (138993)');
      const peopleCheckbox = fieldFacetsComponent.getByLabelText('People (133760)');
      const placesCheckbox = fieldFacetsComponent.getByLabelText('Places (129139)');
      const thingsCheckbox = fieldFacetsComponent.getByLabelText('Things (76403)');
      expect(animalsCheckbox).toBeInTheDocument();
      expect(peopleCheckbox).toBeInTheDocument();
      expect(placesCheckbox).toBeInTheDocument();
      expect(thingsCheckbox).toBeInTheDocument();
    });

    test('checkboxes are unchecked when initially rendered', async () => {
      const { fieldFacetsComponent } = setup();
      const animalsCheckbox = await fieldFacetsComponent.findByLabelText('Animals (138993)');
      expect(animalsCheckbox['checked']).toEqual(false);
    });

    test('checkboxes are checked when set in filter query', async () => {
      const { fieldFacetsComponent } = setup({ filter: 'subject::Animals' });
      const animalsCheckbox = await fieldFacetsComponent.findByLabelText('Animals (138993)');
      expect(animalsCheckbox['checked']).toEqual(true);
    });
  });

  describe('checkboxes apply filters', () => {
    test('it adds correct filter when one checkbox within single facet is checked', async () => {
      const { fieldFacetsComponent, performSearchMock, onChangeMock } = setup();
      const animalsCheckbox = await fieldFacetsComponent.findByLabelText('Animals (138993)');
      performSearchMock.mockReset();
      fireEvent.click(animalsCheckbox);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: 'subject::"Animals"'
        }),
        false
      );
      // test exposed onChange function
      expect(onChangeMock).toBeCalled();
    });

    test('it adds correct filter when aggregation contains `|`', async () => {
      const { fieldFacetsComponent, performSearchMock, onChangeMock } = setup({
        collapsedFacetsCount: 10
      });
      const animalsCheckbox = await fieldFacetsComponent.findByLabelText('This | that (2727)');
      performSearchMock.mockReset();
      fireEvent.click(animalsCheckbox);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: 'subject::"This | that"'
        }),
        false
      );
      expect(onChangeMock).toBeCalled();
    });

    test('it adds correct filter when aggregation contains `,`', async () => {
      const { fieldFacetsComponent, performSearchMock, onChangeMock } = setup({
        collapsedFacetsCount: 10
      });
      const animalsCheckbox = await fieldFacetsComponent.findByLabelText('hey, you (8282)');
      performSearchMock.mockReset();
      fireEvent.click(animalsCheckbox);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: 'subject::"hey, you"'
        }),
        false
      );
      expect(onChangeMock).toBeCalled();
    });

    test('it adds correct filter when aggregation contains `:`', async () => {
      const { fieldFacetsComponent, performSearchMock, onChangeMock } = setup({
        collapsedFacetsCount: 10
      });
      const animalsCheckbox = await fieldFacetsComponent.findByLabelText('something: else (18111)');
      performSearchMock.mockReset();
      fireEvent.click(animalsCheckbox);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: 'subject::"something: else"'
        }),
        false
      );
      expect(onChangeMock).toBeCalled();
    });

    test('it adds correct filters when second checkbox within single facet is checked', async () => {
      const { fieldFacetsComponent, performSearchMock, onChangeMock } = setup({
        filter: 'subject::Animals'
      });
      const peopleCheckbox = await fieldFacetsComponent.findByLabelText('People (133760)');
      performSearchMock.mockReset();
      fireEvent.click(peopleCheckbox);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: 'subject::"Animals"|subject::"People"'
        }),
        false
      );
      expect(onChangeMock).toBeCalled();
    });

    test('it adds correct filter when checkboxes from multiple facets are checked', async () => {
      const { fieldFacetsComponent, performSearchMock, onChangeMock } = setup({
        filter: 'subject::"Animals"'
      });
      const newsStaffCheckbox = await fieldFacetsComponent.findByLabelText('News Staff (57158)');
      performSearchMock.mockReset();
      fireEvent.click(newsStaffCheckbox);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: 'author::"News Staff",subject::"Animals"'
        }),
        false
      );
      expect(onChangeMock).toBeCalled();
    });

    test('maintains the same order of checkboxes before and after selection', async () => {
      const { fieldFacetsComponent, onChangeMock } = setup();
      const expectedLabels = [
        'ABMN Staff (138993)',
        'News Staff (57158)',
        'editor (32444)',
        'Animals (138993)',
        'People (133760)',
        'Places (129139)',
        'Things (76403)',
        'This | that (2727)'
      ];
      await fieldFacetsComponent.findByLabelText(expectedLabels[0]);

      const beforeLabels = [].slice.call(fieldFacetsComponent.container.querySelectorAll('label'));
      expect(beforeLabels.map((label: HTMLLabelElement) => label.textContent)).toEqual(
        expectedLabels
      );

      const newsStaffCheckbox = fieldFacetsComponent.getByLabelText('News Staff (57158)');
      fireEvent.click(newsStaffCheckbox);

      const afterLabels = [].slice.call(fieldFacetsComponent.container.querySelectorAll('label'));
      expect(afterLabels.map((label: HTMLLabelElement) => label.textContent)).toEqual(
        expectedLabels
      );
      expect(onChangeMock).toBeCalled();
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

      beforeEach(async () => {
        setupResult = setup({ aggregationResults: [termAgg, termAgg2], filter: 'foo::two' });
        // wait for component to finish rendering (prevent "act" warning)
        await waitFor(() => {
          expect(setupResult.fieldFacetsComponent).toBeDefined();
        });
      });

      test('should only deselect one of the two', () => {
        const { fieldFacetsComponent } = setupResult;
        const checkboxes = fieldFacetsComponent.getAllByLabelText('two (2)');
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
    beforeEach(async () => {
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
      const filter = 'foo::"hi"';
      setupResult = setup({ componentSettingsAggregations, aggregationResults, filter });
      // wait for component to finish rendering (prevent "act" warning)
      await waitFor(() => {
        expect(setupResult.fieldFacetsComponent).toBeDefined();
      });
    });

    test('should only select one of the two', () => {
      const { fieldFacetsComponent } = setupResult;
      const checkboxes = fieldFacetsComponent.getAllByLabelText('hi (1)');
      expect(checkboxes).toHaveLength(2);
      expect(checkboxes[0]['checked']).toEqual(true);
      expect(checkboxes[1]['checked']).toEqual(false);
    });
  });

  describe('checkboxes remove filters', () => {
    test('it removes correct filter when checkbox within single facet is unchecked', async () => {
      const { fieldFacetsComponent, performSearchMock } = setup({ filter: 'subject::Animals' });
      const animalsCheckbox = await fieldFacetsComponent.findByLabelText('Animals (138993)');
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
      beforeEach(async () => {
        setupData = setup();
        // wait for component to finish rendering (prevent "act" warning)
        await waitFor(() => {
          expect(setupData.fieldFacetsComponent).toBeDefined();
        });
      });

      test('the clear button does not appear', () => {
        const { fieldFacetsComponent } = setupData;
        expect(fieldFacetsComponent.queryAllByTitle('Clear all selected items')).toHaveLength(0);
      });
    });

    describe('when 1 selection is made', () => {
      beforeEach(async () => {
        setupData = setup({ filter: 'author::"ABMN Staff"' });
        // wait for component to finish rendering (prevent "act" warning)
        await waitFor(() => {
          expect(setupData.fieldFacetsComponent).toBeDefined();
        });
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
      beforeEach(async () => {
        setupData = setup({ filter: 'author::"ABMN Staff"|author::"News Staff"' });
        // wait for component to finish rendering (prevent "act" warning)
        await waitFor(() => {
          expect(setupData.fieldFacetsComponent).toBeDefined();
        });
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
      beforeEach(async () => {
        setupData = setup({ filter: 'author::"ABMN Staff",subject::"Animals"' });
        // wait for component to finish rendering (prevent "act" warning)
        await waitFor(() => {
          expect(setupData.fieldFacetsComponent).toBeDefined();
        });
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
              filter: 'subject::"Animals"',
              offset: 0
            }),
            false
          );
        });
      });
    });
  });

  describe('when multiple_selections_allowed is false', () => {
    test('radiobuttons are selected when set in filter query', async () => {
      const { fieldFacetsComponent } = setup({
        filter: 'subject::Animals',
        componentSettingsAggregations: updateSelectionSettings(['subject_id'])
      });
      const animalRadioButton = await fieldFacetsComponent.findAllByLabelText('Animals (138993)');
      expect(animalRadioButton[0]['checked']).toEqual(true);
    });

    test('it only allows one element selected at a time', async () => {
      const { fieldFacetsComponent, performSearchMock } = setup({
        componentSettingsAggregations: updateSelectionSettings(['subject_id'])
      });
      //Carbon uses a Label element that also has @aria-label, which matches twice
      const animalRadioButton = await fieldFacetsComponent.findAllByLabelText('Animals (138993)');
      fireEvent.click(animalRadioButton[0]);
      performSearchMock.mockReset();
      const peopleRadioButton = fieldFacetsComponent.getAllByLabelText('People (133760)');
      fireEvent.click(peopleRadioButton[0]);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: 'subject::"People"',
          offset: 0
        }),
        false
      );
    });

    test('it allows unselecting term', async () => {
      const { fieldFacetsComponent, performSearchMock } = setup({
        componentSettingsAggregations: updateSelectionSettings(['subject_id'])
      });
      //Carbon uses a Label element that also has @aria-label, which matches twice
      const animalRadioButton = await fieldFacetsComponent.findAllByLabelText('Animals (138993)');
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

    test('it allows other fields to still be multiselect', async () => {
      const { fieldFacetsComponent, performSearchMock } = setup({
        componentSettingsAggregations: updateSelectionSettings(['subject_id'])
      });
      //Carbon uses a Label element that also has @aria-label, which matches twice
      const animalRadioButton = await fieldFacetsComponent.findAllByLabelText('Animals (138993)');
      fireEvent.click(animalRadioButton[0]);

      const ABMNStaffCheckbox = fieldFacetsComponent.getByLabelText('ABMN Staff (138993)');
      fireEvent.click(ABMNStaffCheckbox);

      const newsStaffCheckbox = fieldFacetsComponent.getByLabelText('News Staff (57158)');
      fireEvent.click(newsStaffCheckbox);

      performSearchMock.mockReset();
      const peopleRadioButton = fieldFacetsComponent.getAllByLabelText('People (133760)');
      fireEvent.click(peopleRadioButton[0]);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: 'author::"ABMN Staff"|author::"News Staff",subject::"People"',
          offset: 0
        }),
        false
      );
    });

    test('it handles multiple, single select fields', async () => {
      const { fieldFacetsComponent, performSearchMock } = setup({
        componentSettingsAggregations: updateSelectionSettings(['author_id', 'subject_id'])
      });
      //Carbon uses a Label element that also has @aria-label, which matches twice
      const animalRadioButton = await fieldFacetsComponent.findAllByLabelText('Animals (138993)');
      fireEvent.click(animalRadioButton[0]);

      const ABMNStaffRadioButton = fieldFacetsComponent.getAllByLabelText('ABMN Staff (138993)');
      fireEvent.click(ABMNStaffRadioButton[0]);

      const newsStaffRadioButton = fieldFacetsComponent.getAllByLabelText('News Staff (57158)');
      fireEvent.click(newsStaffRadioButton[0]);

      performSearchMock.mockReset();
      const peopleRadioButton = fieldFacetsComponent.getAllByLabelText('People (133760)');
      fireEvent.click(peopleRadioButton[0]);
      expect(performSearchMock).toBeCalledTimes(1);
      expect(performSearchMock).toBeCalledWith(
        expect.objectContaining({
          filter: 'author::"News Staff",subject::"People"',
          offset: 0
        }),
        false
      );
    });
  });

  describe('with categories', () => {
    let setupResult: Setup;
    beforeEach(async () => {
      setupResult = setup({
        aggregationResults: facetsQueryResponse.result.aggregations,
        componentSettingsAggregations: [
          {
            name: 'entities',
            label: 'Top Entities',
            multiple_selections_allowed: true
          },
          {
            name: 'category_id',
            label: 'Category',
            multiple_selections_allowed: true
          },
          {
            name: 'machine_learning_id',
            label: 'Machine Learning Terms',
            multiple_selections_allowed: true
          },
          {
            name: 'products',
            label: 'Products',
            multiple_selections_allowed: false
          }
        ]
      });
      // wait for component to finish rendering (prevent "act" warning)
      await waitFor(() => {
        expect(setupResult.fieldFacetsComponent).toBeDefined();
      });
    });

    describe('legend header elements', () => {
      test('contains all facet headers with correct text', () => {
        const { fieldFacetsComponent } = setupResult;
        const headerTopEntities = fieldFacetsComponent.getByText('Top Entities');
        expect(headerTopEntities).toBeDefined();
        const headerCategory = fieldFacetsComponent.getByText('Category');
        expect(headerCategory).toBeDefined();
        const headerMachineLearningTerms = fieldFacetsComponent.getByText('Machine Learning Terms');
        expect(headerMachineLearningTerms).toBeDefined();
        const headerProducts = fieldFacetsComponent.getAllByText('Products');
        expect(headerProducts).toBeDefined();
      });

      test('nested facets with the field enriched_text.entities.text render correctly', async () => {
        let nestedResult: Setup;
        nestedResult = setup({
          aggregationResults: nestedFacetQueryResponse.result.aggregations
        });
        const { fieldFacetsComponent } = nestedResult;
        const headerEnrichedEntities = await fieldFacetsComponent.findByText(
          'enriched_text.entities.text'
        );
        expect(headerEnrichedEntities).toBeDefined();
      });
    });

    describe('entities facet category elements', () => {
      test('contain all expected category headers', () => {
        const { fieldFacetsComponent } = setupResult;
        const headerTopEntities = fieldFacetsComponent.getByText('Top Entities');
        const topEntitiesGroupContainer = headerTopEntities.parentElement!.parentElement!;
        const topEntitiesHeaders =
          within(topEntitiesGroupContainer).queryAllByTestId('search-facet-category');
        expect(topEntitiesHeaders).toHaveLength(3);

        const locationCategoryHeader = fieldFacetsComponent.getByText('Location');
        const organizationCategoryHeader = fieldFacetsComponent.getByText('Organization');
        const quantityCategoryHeader = fieldFacetsComponent.getByText('Quantity');
        expect(locationCategoryHeader).toBeDefined();
        expect(organizationCategoryHeader).toBeDefined();
        expect(quantityCategoryHeader).toBeDefined();
      });

      test('are collapsed on initial load and facet values are not shown', () => {
        const { fieldFacetsComponent } = setupResult;
        const ibmFacetValue = fieldFacetsComponent.queryByText('ibm (138993)');
        const pittsburghFacetValue = fieldFacetsComponent.queryByText('pittsburgh (57158)');
        const usFacetValue = fieldFacetsComponent.queryByText('us (57158)');
        const euFacetValue = fieldFacetsComponent.queryByText('eu (57158)');
        const quantityFacetValue = fieldFacetsComponent.queryByText('$299 (32444)');
        expect(ibmFacetValue).toBe(null);
        expect(pittsburghFacetValue).toBe(null);
        expect(quantityFacetValue).toBe(null);
        expect(usFacetValue).toBe(null);
        expect(euFacetValue).toBe(null);
      });

      describe('when expanded', () => {
        test('initially show only first 5 facet values of expanded category', () => {
          const { fieldFacetsComponent } = setupResult;
          const locationCategoryHeader = fieldFacetsComponent.getByText('Location');
          fireEvent.click(locationCategoryHeader);
          const pittsburghFacetValue = fieldFacetsComponent.getByText('pittsburgh (57158)');
          const usFacetValue = fieldFacetsComponent.getByText('us (57158)');
          const euFacetValue = fieldFacetsComponent.getByText('eu (57158)');
          const bostonFacetValue = fieldFacetsComponent.queryByText('boston (57158)');
          const pennsylvaniaFacetValue = fieldFacetsComponent.queryByText('pennsylvania (57158)');
          const quantityFacetValue = fieldFacetsComponent.queryByText('$299 (32444)');
          const ibmFacetValue = fieldFacetsComponent.queryByText('ibm (138993)');
          expect(pittsburghFacetValue).toBeDefined();
          expect(usFacetValue).toBeDefined();
          expect(euFacetValue).toBeDefined();
          expect(bostonFacetValue).toBe(null);
          expect(pennsylvaniaFacetValue).toBe(null);
          expect(quantityFacetValue).toBe(null);
          expect(ibmFacetValue).toBe(null);
        });

        test('can be toggled to show more than 5 facet values of expanded category', () => {
          const { fieldFacetsComponent } = setupResult;
          const locationCategoryHeader = fieldFacetsComponent.getByText('Location');
          fireEvent.click(locationCategoryHeader);
          const showMore = fieldFacetsComponent.getByTestId('show-more-less-Location');
          fireEvent.click(showMore);
          const bostonFacetValue = fieldFacetsComponent.getByText('boston (57158)');
          const pennsylvaniaFacetValue = fieldFacetsComponent.getByText('pennsylvania (57158)');
          expect(bostonFacetValue).toBeDefined();
          expect(pennsylvaniaFacetValue).toBeDefined();
        });

        test('if a category has 11-15 facet values, a modal with no search bar opens when Show all is clicked', () => {
          const { fieldFacetsComponent } = setupResult;
          const quantityCategoryHeader = fieldFacetsComponent.getByText('Quantity');
          fireEvent.click(quantityCategoryHeader);
          const showMore = fieldFacetsComponent.getByTestId('show-more-less-Quantity');
          fireEvent.click(showMore);
          const quantityModal = fieldFacetsComponent.getByTestId(
            'search-facet-show-more-modal-Top Entities'
          );
          expect(quantityModal).toBeDefined();
          const topEntitiesHeader = within(quantityModal).getByText('Top Entities: Quantity');
          expect(topEntitiesHeader).toBeDefined();
          const quantitySearchBar = within(quantityModal).queryByTestId(
            'search-facet-modal-search-bar-Top Entities'
          );
          expect(quantitySearchBar).toBeNull();
          const topEntitiesQuantityFacets = within(quantityModal).queryAllByText(
            (content, element) => {
              return (
                element?.tagName.toLowerCase() === 'span' &&
                [
                  '$299 (32444)',
                  '$399 (32444)',
                  '$499 (32444)',
                  '$599 (32444)',
                  '$699 (32444)',
                  '$799 (32444)',
                  '$899 (32444)',
                  '$999 (32444)',
                  '$1099 (32444)',
                  '$1199 (32444)',
                  '$1299 (32444)'
                ].includes(content)
              );
            }
          );
          expect(topEntitiesQuantityFacets).toHaveLength(11);
        });

        test('if a category has over 15 facet values, a modal with a search bar opens when Show all is clicked', () => {
          const { fieldFacetsComponent } = setupResult;
          const showMore = fieldFacetsComponent.getByTestId('show-more-less-Products');
          fireEvent.click(showMore);
          const productsModal = fieldFacetsComponent.getByTestId(
            'search-facet-show-more-modal-Products'
          );
          expect(productsModal).toBeDefined();
          const productsSearchBar = within(productsModal).getByTestId(
            'search-facet-modal-search-bar-Products'
          );
          expect(productsSearchBar).toBeDefined();
          const productsFacets = within(productsModal).queryAllByText((content, element) => {
            return (
              element?.tagName.toLowerCase() === 'span' &&
              [
                'discovery (138993)',
                'studio (57158)',
                'openscale (32444)',
                'assistant (32444)',
                'speech to text (57158)',
                'knowledge catalog (57158)',
                'nlu (57158)',
                'API kit (57158)',
                'openpages (57158)',
                'visual recognition (57158)',
                'language translator (57158)',
                'machine learning (57158)',
                'tone analyzer (57158)',
                'personality insights (57158)',
                'cybersecurity (57158)',
                'language classifier (57158)'
              ].includes(content)
            );
          });
          expect(productsFacets).toHaveLength(16);
        });

        test('can expand multiple categories and collapse them again', () => {
          const { fieldFacetsComponent } = setupResult;
          // First test that expanding multiple categories shows each category's facet values
          const locationCategoryHeader = fieldFacetsComponent.getByText('Location');
          const organizationCategoryHeader = fieldFacetsComponent.getByText('Organization');
          fireEvent.click(locationCategoryHeader);
          fireEvent.click(organizationCategoryHeader);
          let pittsburghFacetValue = fieldFacetsComponent.queryByText('pittsburgh (57158)');
          let ibmFacetValue = fieldFacetsComponent.queryByText('ibm (138993)');
          expect(pittsburghFacetValue).toBeDefined();
          expect(ibmFacetValue).toBeDefined();
          // Then test that on collapse, the categories' facet values are no longer shown
          fireEvent.click(locationCategoryHeader);
          pittsburghFacetValue = fieldFacetsComponent.queryByText('pittsburgh (57158)');
          ibmFacetValue = fieldFacetsComponent.queryByText('ibm (138993)');
          expect(pittsburghFacetValue).toBe(null);
          expect(ibmFacetValue).toBeDefined();
          fireEvent.click(organizationCategoryHeader);
          ibmFacetValue = fieldFacetsComponent.queryByText('ibm (138993)');
          expect(ibmFacetValue).toBe(null);
        });
      });

      describe('when clearing facets', () => {
        test('can select facet values within one category and clear them', () => {
          const { fieldFacetsComponent, performSearchMock } = setupResult;
          const locationCategoryHeader = fieldFacetsComponent.getByText('Location');
          fireEvent.click(locationCategoryHeader);
          let pittsburghFacetValue = fieldFacetsComponent.getByLabelText('pittsburgh (57158)');
          let usFacetValue = fieldFacetsComponent.getByLabelText('us (57158)');
          // First select facet values in one category and test it calls search with expected filter
          fireEvent.click(pittsburghFacetValue);
          expect(performSearchMock).toBeCalledTimes(1);
          expect(performSearchMock).toBeCalledWith(
            expect.objectContaining({
              filter: 'enriched_text.entities.text::"pittsburgh"',
              offset: 0
            }),
            false
          );
          fireEvent.click(usFacetValue);
          expect(performSearchMock).toBeCalledTimes(2);
          expect(performSearchMock).toBeCalledWith(
            expect.objectContaining({
              filter: 'enriched_text.entities.text::"us"|enriched_text.entities.text::"pittsburgh"',
              offset: 0
            }),
            false
          );
          expect(pittsburghFacetValue['checked']).toEqual(true);
          expect(usFacetValue['checked']).toEqual(true);
          // Then clear the facet values and test it calls search with expected empty filter
          const clearButton = fieldFacetsComponent.getByTitle('Clear all selected items');
          fireEvent.click(clearButton);
          expect(performSearchMock).toBeCalledTimes(3);
          expect(performSearchMock).toBeCalledWith(
            expect.objectContaining({
              filter: '',
              offset: 0
            }),
            false
          );
          pittsburghFacetValue = fieldFacetsComponent.getByLabelText('pittsburgh (57158)');
          usFacetValue = fieldFacetsComponent.getByLabelText('us (57158)');
          expect(pittsburghFacetValue['checked']).toEqual(false);
          expect(usFacetValue['checked']).toEqual(false);
        });

        test('can select facet values across multiple categories and clear them', () => {
          const { fieldFacetsComponent, performSearchMock } = setupResult;
          const locationCategoryHeader = fieldFacetsComponent.getByText('Location');
          const organizationCategoryHeader = fieldFacetsComponent.getByText('Organization');
          // First select facet values across multiple categories and test it calls search with expected filters
          fireEvent.click(locationCategoryHeader);
          fireEvent.click(organizationCategoryHeader);
          let pittsburghFacetValue = fieldFacetsComponent.getByLabelText('pittsburgh (57158)');
          let ibmFacetValue = fieldFacetsComponent.getByLabelText('ibm (138993)');
          fireEvent.click(pittsburghFacetValue);
          expect(performSearchMock).toBeCalledTimes(1);
          expect(performSearchMock).toBeCalledWith(
            expect.objectContaining({
              filter: 'enriched_text.entities.text::"pittsburgh"',
              offset: 0
            }),
            false
          );
          fireEvent.click(ibmFacetValue);
          expect(performSearchMock).toBeCalledTimes(2);
          expect(performSearchMock).toBeCalledWith(
            expect.objectContaining({
              filter:
                'enriched_text.entities.text::"ibm",enriched_text.entities.text::"pittsburgh"',
              offset: 0
            }),
            false
          );
          pittsburghFacetValue = fieldFacetsComponent.getByLabelText('pittsburgh (57158)');
          ibmFacetValue = fieldFacetsComponent.getByLabelText('ibm (138993)');
          expect(pittsburghFacetValue['checked']).toEqual(true);
          expect(ibmFacetValue['checked']).toEqual(true);
          // Then clear facet values across multiple categories and test it calls search with empty filter
          const clearButton = fieldFacetsComponent.getByTitle('Clear all selected items');
          fireEvent.click(clearButton);
          expect(performSearchMock).toBeCalledTimes(3);
          expect(performSearchMock).toBeCalledWith(
            expect.objectContaining({
              filter: '',
              offset: 0
            }),
            false
          );
          pittsburghFacetValue = fieldFacetsComponent.getByLabelText('pittsburgh (57158)');
          ibmFacetValue = fieldFacetsComponent.getByLabelText('ibm (138993)');
          expect(pittsburghFacetValue['checked']).toEqual(false);
          expect(ibmFacetValue['checked']).toEqual(false);
        });
      });
    });
  });
});
