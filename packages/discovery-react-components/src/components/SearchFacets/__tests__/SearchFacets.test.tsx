import * as React from 'react';
import { render, RenderResult, fireEvent, wait } from '@testing-library/react';
import { QueryTermAggregation } from 'ibm-watson/discovery/v2';
import { wrapWithContext } from 'utils/testingUtils';
import SearchFacets from '../SearchFacets';
import {
  SearchContextIFC,
  SearchApiIFC,
  searchResponseStoreDefaults,
  globalAggregationsResponseStoreDefaults
} from 'components/DiscoverySearch/DiscoverySearch';
import { facetsQueryResponse } from '../__fixtures__/facetsQueryResponse';
import collectionsResponse from '../__fixtures__/collectionsResponse';
import { noAvailableFacetsMessage } from '../utils/searchFacetMessages';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { GlobalAggregationsResponseStore } from 'utils/useDataApi';

interface Props {
  filter?: string;
  showCollections?: boolean;
  aggregations?: any;
  globalAggregationsResponseStoreOverrides?: GlobalAggregationsResponseStore;
  componentSettingsAggregations?: DiscoveryV2.ComponentSettingsAggregation[];
  collectionIds?: string[];
  fetchAggregationsMock?: jest.Mock<any, any>;
  serverErrorMessage?: React.ReactNode;
}

interface Setup {
  context: Partial<SearchContextIFC>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchAggregationsMock: jest.Mock<any, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  performSearchMock: jest.Mock<any, any>;
  onChangeMock: jest.Mock;
  searchFacetsComponent: RenderResult;
}

const setup = ({
  filter = '',
  showCollections = false,
  aggregations = facetsQueryResponse.result.aggregations,
  globalAggregationsResponseStoreOverrides,
  componentSettingsAggregations,
  collectionIds,
  fetchAggregationsMock,
  serverErrorMessage
}: Props = {}): Setup => {
  fetchAggregationsMock = fetchAggregationsMock || jest.fn();
  const performSearchMock = jest.fn();
  const onChangeMock = jest.fn();

  const context: Partial<SearchContextIFC> = {
    globalAggregationsResponseStore: {
      ...globalAggregationsResponseStoreDefaults,
      parameters: {
        projectId: '',
        aggregation: '[term(author,count:3),term(subject,count:4)]'
      },
      data: aggregations,
      ...globalAggregationsResponseStoreOverrides
    },
    collectionsResults: collectionsResponse.result,
    searchResponseStore: {
      ...searchResponseStoreDefaults,
      parameters: {
        projectId: '',
        collectionIds,
        filter
      }
    },
    componentSettings: {
      aggregations: componentSettingsAggregations
    }
  };

  const api: Partial<SearchApiIFC> = {
    performSearch: performSearchMock,
    fetchAggregations: fetchAggregationsMock
  };

  const searchFacetsComponent = render(
    wrapWithContext(
      <SearchFacets
        showCollections={showCollections}
        onChange={onChangeMock}
        serverErrorMessage={serverErrorMessage}
      />,
      api,
      context
    )
  );

  return {
    context,
    performSearchMock,
    onChangeMock,
    fetchAggregationsMock,
    searchFacetsComponent
  };
};

describe('SearchFacetsComponent', () => {
  let globalAggregationsResponseStoreOverrides: GlobalAggregationsResponseStore;
  describe('component load', () => {
    test('it calls fetch aggregations with aggregation string', async () => {
      globalAggregationsResponseStoreOverrides = {
        ...globalAggregationsResponseStoreOverrides,
        data: null
      };
      const { fetchAggregationsMock } = setup({
        globalAggregationsResponseStoreOverrides
      });
      expect(fetchAggregationsMock).toBeCalledTimes(1);
      expect(fetchAggregationsMock).toBeCalledWith(
        expect.objectContaining({
          aggregation: '[term(author,count:3),term(subject,count:4)]'
        })
      );
      await wait(); // wait for component to finish rendering (prevent "act" warning)
    });

    test('shows error message when fetch aggregations fails', async () => {
      globalAggregationsResponseStoreOverrides = {
        ...globalAggregationsResponseStoreOverrides,
        data: [],
        isError: true
      };
      const { searchFacetsComponent } = setup({
        fetchAggregationsMock: jest.fn().mockImplementationOnce(() => {
          const httpError: any = new Error('500 Server Error');
          httpError.status = httpError.statusCode = 500;
          throw httpError;
        }),
        globalAggregationsResponseStoreOverrides
      });

      const errorMsg = await searchFacetsComponent.findByText('Error fetching facets.');
      expect(errorMsg).toBeVisible();
    });

    test('shows custom error message string when fetch aggregations fails', () => {
      globalAggregationsResponseStoreOverrides = {
        ...globalAggregationsResponseStoreOverrides,
        data: [],
        isError: true
      };
      const { searchFacetsComponent } = setup({
        fetchAggregationsMock: jest.fn().mockImplementationOnce(() => {
          const httpError: any = new Error('500 Server Error');
          httpError.status = httpError.statusCode = 500;
          throw httpError;
        }),
        serverErrorMessage: 'You messed up!',
        globalAggregationsResponseStoreOverrides
      });

      searchFacetsComponent.getByText('You messed up!');
    });

    test('shows custom error message Element when fetch aggregations fails', () => {
      globalAggregationsResponseStoreOverrides = {
        ...globalAggregationsResponseStoreOverrides,
        data: [],
        isError: true
      };
      const { searchFacetsComponent } = setup({
        fetchAggregationsMock: jest.fn().mockImplementationOnce(() => {
          const httpError: any = new Error('500 Server Error');
          httpError.status = httpError.statusCode = 500;
          throw httpError;
        }),
        serverErrorMessage: <span data-testid="server-msg-failure">FAILURE</span>,
        globalAggregationsResponseStoreOverrides
      });

      const elem = searchFacetsComponent.getByTestId('server-msg-failure');
      expect(elem.textContent).toEqual('FAILURE');
    });
  });

  describe('field facets', () => {
    describe('when aggregations exist', () => {
      describe('legend header elements', () => {
        describe('When there are no aggregation component settings', () => {
          test('contains first facet header with category field text', async () => {
            const { searchFacetsComponent } = setup();
            const headerCategoryField = await searchFacetsComponent.findByText('category');
            expect(headerCategoryField).toBeVisible();
          });

          test('contains second facet header with machine_learning_terms field text', async () => {
            const { searchFacetsComponent } = setup();
            const headerMachineLearningTermsField = await searchFacetsComponent.findByText(
              'machine_learning_terms'
            );
            expect(headerMachineLearningTermsField).toBeVisible();
          });
        });

        describe('When there are aggregation component settings', () => {
          test('should render the labels contained in aggregation component settings', async () => {
            const { searchFacetsComponent } = setup({
              componentSettingsAggregations: [
                { label: 'label1', name: 'category_id' },
                { label: 'label2', name: 'machine_learning_id' }
              ]
            });
            const label1 = await searchFacetsComponent.findByText('label1');
            expect(label1).toBeVisible();
            expect(searchFacetsComponent.getByText('label2')).toBeVisible();
          });

          describe('And there is a filter string also', () => {
            test('should render the labels contained in aggregation component settings', async () => {
              const { searchFacetsComponent } = setup({
                filter: 'author:"editor"',
                componentSettingsAggregations: [
                  { label: 'label1', name: 'category_id' },
                  { label: 'label2', name: 'machine_learning_id' }
                ]
              });
              const label1 = await searchFacetsComponent.findByText('label1');
              expect(label1).toBeVisible();
              expect(searchFacetsComponent.getByText('label2')).toBeVisible();
            });
          });
        });
      });
    });

    describe('when no aggregations exist', () => {
      test('shows empty aggregations message', async () => {
        const { searchFacetsComponent } = setup({ aggregations: [] });
        const emptyMessage = await searchFacetsComponent.findByText(noAvailableFacetsMessage);
        expect(emptyMessage).toBeVisible();
      });
    });
  });

  describe('collection facet', () => {
    describe('when collections exists', () => {
      test('can be shown', async () => {
        const { searchFacetsComponent } = setup({
          filter: 'subject:Animals',
          showCollections: true
        });
        const collectionSelect = await searchFacetsComponent.findByText('Available collections');
        expect(collectionSelect).toBeVisible();
      });

      test('can be hidden', async () => {
        const { searchFacetsComponent } = setup({ filter: 'subject:Animals' });
        const collectionSelect = searchFacetsComponent.queryByText('Available collections');
        expect(collectionSelect).toBeNull();
        await wait(); // wait for component to finish rendering (prevent "act" warning)
      });
    });

    describe('when no collections exists', () => {
      test('is not shown', async () => {
        const { searchFacetsComponent } = setup({ filter: 'subject:Animals' });
        const collectionSelect = searchFacetsComponent.queryByText('Available collections');
        expect(collectionSelect).toBeNull();
        await wait(); // wait for component to finish rendering (prevent "act" warning)
      });
    });
  });

  describe('root clear all button', () => {
    let setupData: Setup;
    describe('when no filters are present', () => {
      beforeEach(async () => {
        setupData = setup();
        await wait(); // wait for component to finish rendering (prevent "act" warning)
      });

      test('does not show the root clear all button', async () => {
        const { searchFacetsComponent } = setupData;
        expect(searchFacetsComponent.queryAllByText('Clear all')).toHaveLength(0);
        await wait(); // wait for component to finish rendering (prevent "act" warning)
      });
    });

    describe('when there are filters present', () => {
      beforeEach(async () => {
        setupData = setup({ filter: 'subject:Animals' });
        await wait(); // wait for component to finish rendering (prevent "act" warning)
      });

      test('does show the root clear all button', async () => {
        const { searchFacetsComponent } = setupData;
        const buttons = await searchFacetsComponent.findAllByText('Clear all');
        expect(buttons).toHaveLength(1);
      });

      describe('and the clear all button is clicked', () => {
        beforeEach(() => {
          const { searchFacetsComponent } = setupData;
          fireEvent.click(searchFacetsComponent.getByText('Clear all'));
        });

        test('resets all the filters', async () => {
          const { performSearchMock, onChangeMock } = setupData;
          expect(performSearchMock).toHaveBeenCalledWith(
            expect.objectContaining({
              filter: '',
              collectionIds: [],
              offset: 0
            }),
            false
          );
          // test exposed onChange function for clear all
          expect(onChangeMock).toHaveBeenCalled();
          await wait(); // wait for component to finish rendering (prevent "act" warning)
        });
      });
    });

    describe('when there are collection facets', () => {
      describe('and some collections are preselected', () => {
        let setupData: Setup;

        beforeEach(async () => {
          setupData = setup({ showCollections: true, collectionIds: ['machine-learning'] });
          await wait(); // wait for component to finish rendering (prevent "act" warning)
        });

        test('does show the root clear all button on load', () => {
          const { searchFacetsComponent } = setupData;
          fireEvent.click(searchFacetsComponent.getByText('Available collections'));
          const checkbox = searchFacetsComponent.getByText('Machine Learning');

          expect(checkbox).toHaveAttribute('data-contained-checkbox-state', 'true');
          expect(searchFacetsComponent.queryAllByText('Clear all')).toHaveLength(1);
        });

        describe('and the clear all button is clicked', () => {
          test('collection is deselected and clear all button is no longer shown', () => {
            const { searchFacetsComponent } = setupData;
            fireEvent.click(searchFacetsComponent.getByText('Clear all'));
            fireEvent.click(searchFacetsComponent.getByText('Available collections'));
            const checkbox = searchFacetsComponent.getByText('Machine Learning');

            expect(checkbox).toHaveAttribute('data-contained-checkbox-state', 'false');
            expect(searchFacetsComponent.queryAllByText('Clear all')).toHaveLength(0);
          });
        });
      });

      describe('and no collections are preselected', () => {
        let setupData: Setup;

        beforeEach(async () => {
          setupData = setup({ showCollections: true });
          await wait(); // wait for component to finish rendering (prevent "act" warning)
        });

        test('does not show the root clear all button on load', async () => {
          const { searchFacetsComponent } = setupData;
          expect(searchFacetsComponent.queryAllByText('Clear all')).toHaveLength(0);
          await wait(); // wait for component to finish rendering (prevent "act" warning)
        });

        describe('and one collection is selected after load', () => {
          test('does show the root clear all button on selection', () => {
            const { searchFacetsComponent } = setupData;
            fireEvent.click(searchFacetsComponent.getByText('Available collections'));
            fireEvent.click(searchFacetsComponent.getByText('Machine Learning'));
            const checkbox = searchFacetsComponent.getByText('Machine Learning');

            expect(checkbox).toHaveAttribute('data-contained-checkbox-state', 'true');
            expect(searchFacetsComponent.queryAllByText('Clear all')).toHaveLength(1);
          });

          describe('and the clear all button is clicked', () => {
            test('the collection is deselected and the clear all button is no longer shown', () => {
              const { searchFacetsComponent } = setupData;
              fireEvent.click(searchFacetsComponent.getByText('Available collections'));
              fireEvent.click(searchFacetsComponent.getByText('Machine Learning'));
              fireEvent.click(searchFacetsComponent.getByText('Clear all'));
              expect(searchFacetsComponent.queryAllByText('Clear all')).toHaveLength(0);
              const checkbox = searchFacetsComponent.getByText('Machine Learning');

              expect(checkbox).toHaveAttribute('data-contained-checkbox-state', 'false');
            });
          });
        });

        describe('and multiple collections are selected after load', () => {
          test('does show the root clear all button on selection', () => {
            const { searchFacetsComponent } = setupData;
            fireEvent.click(searchFacetsComponent.getByText('Available collections'));
            fireEvent.click(searchFacetsComponent.getByText('Machine Learning'));
            fireEvent.click(searchFacetsComponent.getByText('AI Strategy'));
            const checkbox = searchFacetsComponent.getByText('Machine Learning');
            const otherCheckbox = searchFacetsComponent.getByText('Machine Learning');

            expect(checkbox).toHaveAttribute('data-contained-checkbox-state', 'true');
            expect(otherCheckbox).toHaveAttribute('data-contained-checkbox-state', 'true');
            expect(searchFacetsComponent.queryAllByText('Clear all')).toHaveLength(1);
          });

          describe('and the clear all button is clicked', () => {
            test('all collections are deselected and the clear all button is no longer shown', () => {
              const { searchFacetsComponent } = setupData;
              fireEvent.click(searchFacetsComponent.getByText('Available collections'));
              fireEvent.click(searchFacetsComponent.getByText('Machine Learning'));
              fireEvent.click(searchFacetsComponent.getByText('AI Strategy'));
              fireEvent.click(searchFacetsComponent.getByText('Clear all'));
              expect(searchFacetsComponent.queryAllByText('Clear all')).toHaveLength(0);
              const checkbox = searchFacetsComponent.getByText('Machine Learning');
              const otherCheckbox = searchFacetsComponent.getByText('Machine Learning');

              expect(checkbox).toHaveAttribute('data-contained-checkbox-state', 'false');
              expect(otherCheckbox).toHaveAttribute('data-contained-checkbox-state', 'false');
            });
          });
        });
      });
    });
  });

  describe('i18n messages', () => {
    let result: RenderResult;
    const termAgg: QueryTermAggregation = {
      type: 'term',
      field: 'one',
      results: [
        {
          key: 'two',
          matching_results: 1
        }
      ]
    };
    describe('when no messages are provided', () => {
      beforeEach(async () => {
        result = render(
          wrapWithContext(
            <SearchFacets />,
            {},
            {
              globalAggregationsResponseStore: {
                ...globalAggregationsResponseStoreDefaults,
                data: [termAgg]
              },
              searchResponseStore: {
                ...searchResponseStoreDefaults,
                parameters: {
                  projectId: '',
                  filter: 'one:"two"'
                }
              }
            }
          )
        );
        await wait(); // wait for component to finish rendering (prevent "act" warning)
      });

      test('uses default messages', () => {
        expect(result.queryAllByText('Clear all')).toHaveLength(1);
        expect(result.queryAllByTitle('Clear all selected items')).toHaveLength(1);
      });
    });

    describe('when a message is overridden', () => {
      beforeEach(async () => {
        result = render(
          wrapWithContext(
            <SearchFacets messages={{ clearAllButtonText: 'different text' }} />,
            {},
            {
              globalAggregationsResponseStore: {
                ...globalAggregationsResponseStoreDefaults,
                data: [termAgg]
              },
              searchResponseStore: {
                ...searchResponseStoreDefaults,
                parameters: {
                  projectId: '',
                  filter: 'one:"two"'
                }
              }
            }
          )
        );
        await wait(); // wait for component to finish rendering (prevent "act" warning)
      });

      test('only overrides provided messages and uses defaults for the rest', () => {
        expect(result.queryAllByText('different text')).toHaveLength(1);
        expect(result.queryAllByTitle('Clear all selected items')).toHaveLength(1);
      });
    });
  });
});
