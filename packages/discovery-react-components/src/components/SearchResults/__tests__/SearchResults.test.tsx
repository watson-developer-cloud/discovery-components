/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';
import { render, fireEvent, RenderResult } from '@testing-library/react';
import {
  SearchContextIFC,
  searchResponseStoreDefaults,
  fetchDocumentsResponseStoreDefaults,
  SearchApiIFC
} from 'components/DiscoverySearch/DiscoverySearch';
import { wrapWithContext } from 'utils/testingUtils';
import SearchResults, { SearchResultsProps, useUpdateQueryReturnParam } from '../SearchResults';
import { getByText as domGetByText } from '@testing-library/dom';
import {
  QueryResult,
  QueryTableResult,
  ComponentSettingsResponse,
  QueryParams
} from 'ibm-watson/discovery/v2';
import { renderHook } from '@testing-library/react-hooks';
import { DisplaySettingsParams } from '../utils/getDisplaySettings';

interface Setup {
  searchResults: RenderResult;
  setSearchParametersMock: jest.Mock;
  fetchDocumentsMock: jest.Mock;
}

function setup(
  {
    queryResults,
    tableResults,
    fetchDocumentsResponseStore,
    suggestedQuery,
    searchResponseStoreOverrides,
    componentSettings
  }: {
    queryResults?: QueryResult[];
    tableResults?: QueryTableResult[];
    suggestedQuery?: string;
    fetchDocumentsResponseStore?: any;
    searchResponseStoreOverrides?: any;
    componentSettings?: ComponentSettingsResponse;
  },
  componentProps: Partial<SearchResultsProps> = {}
): Setup {
  const api = { setSearchParameters: jest.fn(), fetchDocuments: jest.fn() };
  let context: Partial<SearchContextIFC> = {
    searchResponseStore: {
      ...searchResponseStoreDefaults,
      data: {
        matching_results: queryResults ? queryResults.length : 0,
        results: queryResults,
        table_results: tableResults,
        suggested_query: suggestedQuery
      },
      ...searchResponseStoreOverrides
    },
    fetchDocumentsResponseStore: {
      ...fetchDocumentsResponseStoreDefaults,
      ...fetchDocumentsResponseStore
    },
    componentSettings
  };

  const searchResults = render(
    wrapWithContext(<SearchResults {...componentProps} />, api, context)
  );
  return {
    searchResults,
    setSearchParametersMock: api.setSearchParameters,
    fetchDocumentsMock: api.fetchDocuments
  };
}

describe('<SearchResults />', () => {
  let setSearchParametersMock: jest.Mock;
  let fetchDocumentsMock: jest.Mock;
  let searchResults: RenderResult;
  let queryResults: QueryResult[] | undefined;
  let tableResults: QueryTableResult[] | undefined;
  let componentProps: Partial<SearchResultsProps> = {};
  let suggestedQuery: string | undefined;
  let searchResponseStoreOverrides: any;
  let componentSettings: ComponentSettingsResponse | undefined;

  afterEach(() => {
    queryResults = undefined;
    tableResults = undefined;
    componentProps = {};
    searchResponseStoreOverrides = undefined;
    suggestedQuery = undefined;
    componentSettings = undefined;
  });

  describe('i18n messages', () => {
    describe('when there are query and table results', () => {
      beforeEach(() => {
        queryResults = [
          {
            document_id: 'some document_id',
            collection_id: 'some collection_id',
            document_passages: [
              {
                passage_text: 'this is the first passage text'
              }
            ]
          } as unknown as QueryResult,
          {
            document_id: 'some other document_id'
          } as unknown as QueryResult
        ];
        tableResults = [
          {
            table_id: '558ada041262d5b0aa02a05429d798c9',
            source_document_id: 'some document_id',
            collection_id: '8713a92b-28aa-b291-0000-016ddc68aa2a',
            table_html: '<html>I am table.</html>'
          }
        ];
      });

      describe('when no messages are provided', () => {
        describe('has the correct default placeholder text', () => {
          test('for search results with passages, tables, and empty results', () => {
            ({ searchResults } = setup({ queryResults, tableResults }, componentProps));
            const collectionLabel = searchResults.getByText('Collection:', { exact: false });
            const viewExcerptInDocumentButtonText = searchResults.getByText(
              'View passage in document'
            );
            const viewTableInDocumentButtonText = searchResults.getByText('View table in document');
            const tablesOnlyToggleLabelText = searchResults.getByText('Show table results only');
            const emptyResultContentBodyText = searchResults.getByText('Excerpt unavailable.');
            expect(collectionLabel).toBeDefined();
            expect(viewExcerptInDocumentButtonText).toBeDefined();
            expect(viewTableInDocumentButtonText).toBeDefined();
            expect(tablesOnlyToggleLabelText).toBeDefined();
            expect(emptyResultContentBodyText).toBeDefined();
          });

          test('for no search results found state', () => {
            queryResults = [];
            ({ searchResults } = setup({ queryResults }, componentProps));
            expect(searchResults.getByText('No results found')).toBeDefined();
          });
        });

        describe('when some messages are overridden', () => {
          test('it only overrides provided messages and uses defaults for the rest', () => {
            componentProps.messages = {
              collectionLabel: 'Collection is:',
              emptyResultContentBodyText: 'Nothing to see here.'
            };
            ({ searchResults } = setup({ queryResults, tableResults }, componentProps));
            const viewExcerptInDocumentButtonText = searchResults.getByText(
              'View passage in document'
            );
            const viewTableInDocumentButtonText = searchResults.getByText('View table in document');
            const tablesOnlyToggleLabelText = searchResults.getByText('Show table results only');
            expect(searchResults.getByText('Collection is:', { exact: false })).toBeDefined();
            expect(viewExcerptInDocumentButtonText).toBeDefined();
            expect(viewTableInDocumentButtonText).toBeDefined();
            expect(tablesOnlyToggleLabelText).toBeDefined();
            expect(searchResults.getByText('Nothing to see here.')).toBeDefined();
          });
        });
      });
    });
  });

  describe('When we have a value for matching_results', () => {
    describe('which is greater than 0', () => {
      beforeEach(() => {
        queryResults = [
          {
            document_id: 'some document_id',
            result_metadata: {
              collection_id: '1'
            }
          }
        ];
      });

      test('renders the results', () => {
        ({ searchResults } = setup({ queryResults }, componentProps));
        expect(searchResults.getByText('some document_id')).toBeInTheDocument();
      });
    });

    describe('which is equal to 0', () => {
      beforeEach(() => {
        queryResults = [];
      });
      test('renders the no results found message', () => {
        ({ searchResults } = setup({ queryResults }, componentProps));
        expect(searchResults.getByText('No results found')).toBeInTheDocument();
      });

      describe('and we have a spelling suggestion', () => {
        beforeEach(() => {
          suggestedQuery = 'suggested';
        });

        test('renders the spelling suggestion', () => {
          ({ searchResults } = setup({ queryResults, suggestedQuery }, componentProps));
          expect(
            searchResults.getByText((_, element) => {
              return element?.textContent === 'suggested';
            })
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe('rendering table results', () => {
    describe('when showTablesOnly is enabled', () => {
      beforeEach(() => {
        componentProps.showTablesOnly = true;
      });

      describe('and there are table results', () => {
        beforeEach(() => {
          tableResults = [
            {
              table_id: '558ada041262d5b0aa02a05429d798c9',
              source_document_id: 'some document_id',
              collection_id: '8713a92b-28aa-b291-0000-016ddc68aa2a',
              table_html: '<html>I am table.</html>'
            }
          ];
        });

        test('the table results are rendered', () => {
          ({ searchResults } = setup({ queryResults, tableResults }, componentProps));
          expect(searchResults.getByText('I am table.')).toBeInTheDocument();
        });
      });

      describe('and there is a Queryresult but no table result', () => {
        beforeEach(() => {
          tableResults = [];
          queryResults = [
            {
              document_id: 'some document_id',
              result_metadata: {
                collection_id: '1'
              }
            }
          ];
        });

        test('renders the no results found message', () => {
          ({ searchResults } = setup({ queryResults, tableResults }, componentProps));
          expect(searchResults.getByText('No results found')).toBeInTheDocument();
        });
      });
    });
  });

  describe('When we do not have results', () => {
    beforeEach(() => {
      searchResponseStoreOverrides = { data: null };
    });

    describe('and results are loading', () => {
      beforeEach(() => {
        searchResponseStoreOverrides = { ...searchResponseStoreOverrides, isLoading: true };
      });

      test('renders the skeleton text', () => {
        ({ searchResults } = setup({ searchResponseStoreOverrides }, componentProps));
        expect(searchResults.getAllByTestId('skeleton_text')).toHaveLength(3);
      });

      describe('and count has been set lower than 3', () => {
        beforeEach(() => {
          searchResponseStoreOverrides = {
            ...searchResponseStoreOverrides,
            parameters: { count: 2 }
          };
        });

        test('renders fewer skeleton text', () => {
          ({ searchResults } = setup({ searchResponseStoreOverrides }, componentProps));
          expect(searchResults.getAllByTestId('skeleton_text')).toHaveLength(2);
        });
      });

      describe('and count has been set higher than 5', () => {
        beforeEach(() => {
          searchResponseStoreOverrides = {
            ...searchResponseStoreOverrides,
            parameters: { count: 10000 }
          };
        });

        test('renders at most 3 skeleton text', () => {
          ({ searchResults } = setup({ searchResponseStoreOverrides }, componentProps));
          expect(searchResults.getAllByTestId('skeleton_text')).toHaveLength(3);
        });
      });
    });

    describe('And we are not in the middle of fetching query_results', () => {
      beforeEach(() => {
        searchResponseStoreOverrides = { ...searchResponseStoreOverrides, isLoading: false };
      });

      test('renders only the header', () => {
        ({ searchResults } = setup({ searchResponseStoreOverrides }, componentProps));
        expect(searchResults.getAllByTestId('search_results_header')).toHaveLength(1);
      });
    });
  });

  describe('when passageLength is defined', () => {
    beforeEach(() => {
      componentProps.passageLength = 20;
    });

    test('onUpdatePassageLength is called with the expected character count', () => {
      ({ setSearchParametersMock } = setup({}, componentProps));
      expect(setSearchParametersMock).toBeCalledTimes(2);
      expect(setSearchParametersMock).toBeCalledWith(expect.any(Function));
      const returnFunc = setSearchParametersMock.mock.calls[1][0];
      const returnValue = returnFunc();
      expect(returnValue).toEqual(
        expect.objectContaining({
          passages: { characters: 20, enabled: true }
        })
      );
    });
  });

  describe('when passageLength is not defined', () => {
    beforeEach(() => {
      componentProps.passageLength = undefined;
    });

    test('onUpdatePassageLength is not called', () => {
      ({ setSearchParametersMock } = setup({}, componentProps));
      expect(setSearchParametersMock).toBeCalledTimes(1);
    });
  });

  describe('when there are component settings in context', () => {
    beforeEach(() => {
      componentSettings = {
        fields_shown: {
          body: {
            use_passage: true
          },
          title: {
            field: 'titleField'
          }
        }
      };
    });

    describe('and there are QueryResults with fields pointed at by component settings', () => {
      beforeEach(() => {
        queryResults = [
          {
            document_id: 'document_id',
            result_metadata: {
              collection_id: '1'
            },
            titleField: 'this title comes from the titleField',
            document_passages: [
              {
                passage_text: 'this is the first passage text'
              }
            ],
            overwrittenTitleField: 'this title comes from the overwritten title field',
            overwrittenBodyField: 'this body text comes from the overwritten body field'
          }
        ];
      });

      describe('and none of those settings are overwritten as props on SearchResults', () => {
        test('should render with component settings', () => {
          ({ searchResults } = setup({ queryResults, componentSettings }));
          expect(searchResults.getByText('this is the first passage text')).toBeInTheDocument();
          expect(
            searchResults.getByText('this title comes from the titleField')
          ).toBeInTheDocument();
        });
      });

      describe('and some of those settings are overwritten as props on SearchResults', () => {
        beforeEach(() => {
          componentProps = {
            usePassages: false,
            bodyField: 'overwrittenBodyField',
            resultTitleField: 'overwrittenTitleField'
          };
        });

        test('should render with the overwritten properties', () => {
          ({ searchResults } = setup({ componentSettings, queryResults }, componentProps));
          expect(
            searchResults.getByText('this title comes from the overwritten title field')
          ).toBeInTheDocument();
          expect(
            searchResults.getByText('this body text comes from the overwritten body field')
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe('when showTablesOnly is true', () => {
    beforeEach(() => {
      componentProps.showTablesOnly = true;
    });

    describe('and there is a QueryTableResult and a QueryResult', () => {
      beforeEach(() => {
        queryResults = [
          {
            document_id: '123',
            result_metadata: {
              collection_id: 'collection_id'
            }
          }
        ];
        tableResults = [
          {
            table_id: 'table id',
            source_document_id: '123',
            collection_id: 'collection_id',
            table_html: '<div>table html</div>',
            table_html_offset: 5,
            table: {}
          }
        ];
      });

      test('fetchDocuments should not be fired', () => {
        ({ fetchDocumentsMock } = setup({ queryResults, tableResults }, componentProps));
        expect(fetchDocumentsMock).not.toBeCalled();
      });

      describe('but the QueryResult document_id does not match the QueryTableResult source_document_id', () => {
        beforeEach(() => {
          queryResults = [
            {
              document_id: '456',
              result_metadata: {
                collection_id: '1'
              }
            }
          ];
        });

        test('fetchDocuments should be fired with the correct params', () => {
          ({ fetchDocumentsMock } = setup({ queryResults, tableResults }, componentProps));
          expect(fetchDocumentsMock).toBeCalledTimes(1);
          expect(fetchDocumentsMock).toBeCalledWith(
            'document_id::123',
            ['collection_id'],
            expect.any(Object)
          );
        });

        describe('and the naturalLanguageQuery changes', () => {
          test('fetchDocuments should be called twice', () => {
            let context: Partial<SearchContextIFC> = {
              searchResponseStore: {
                isLoading: false,
                isError: false,
                parameters: {
                  projectId: 'my project id'
                },
                data: {
                  matching_results: 1,
                  results: [
                    {
                      document_id: '456',
                      result_metadata: {
                        collection_id: '1'
                      }
                    }
                  ],
                  table_results: [
                    {
                      table_id: 'table id',
                      source_document_id: '123',
                      collection_id: 'collection_id',
                      table_html: '<div>table html</div>',
                      table_html_offset: 5,
                      table: {}
                    }
                  ]
                },
                error: null
              }
            };

            const mockFetchDocuments = jest.fn();
            const api = {
              fetchDocuments: mockFetchDocuments
            };
            const fullTree = wrapWithContext(
              <SearchResults showTablesOnlyToggle={true} />,
              api,
              context
            );
            const { getByText, rerender } = render(fullTree);
            const toggle = getByText('Show table results only');
            fireEvent.click(toggle);
            rerender(
              wrapWithContext(<SearchResults showTablesOnlyToggle={true} />, api, {
                ...context,
                searchResponseStore: {
                  ...context.searchResponseStore!,
                  parameters: {
                    ...context.searchResponseStore!.parameters,
                    naturalLanguageQuery: 'foo'
                  }
                }
              })
            );
            expect(mockFetchDocuments).toBeCalledTimes(2);
            expect(mockFetchDocuments.mock.calls[0][0]).toEqual('document_id::123');
            expect(mockFetchDocuments.mock.calls[1][0]).toEqual('document_id::123');
          });
        });
      });
    });

    describe('And we are trying to render multiple tables which do not have a corresponding result document', () => {
      beforeEach(() => {
        queryResults = [
          {
            document_id: '789',
            result_metadata: {
              collection_id: '1'
            }
          }
        ];
        tableResults = [
          {
            table_id: 'table id',
            source_document_id: '123',
            collection_id: 'collection_id',
            table_html: '<div>table html</div>',
            table_html_offset: 5,
            table: {}
          },
          {
            table_id: 'table id 2',
            source_document_id: '456',
            collection_id: 'collection_id',
            table_html: '<div>table html</div>',
            table_html_offset: 5,
            table: {}
          }
        ];
      });

      test('searchClient.query should be fired with the correct params', () => {
        ({ fetchDocumentsMock } = setup({ queryResults, tableResults }, componentProps));
        expect(fetchDocumentsMock).toBeCalledTimes(1);
        expect(fetchDocumentsMock).toBeCalledWith(
          'document_id::123|456',
          ['collection_id'],
          expect.any(Object)
        );
      });
    });
  });

  describe('the empty result state', () => {
    describe('when there is no table result, no passage, bodyField is not specified, and there is no text field but there is a result for a document', () => {
      beforeEach(() => {
        tableResults = [];
        componentProps.bodyField = undefined;
        queryResults = [
          {
            document_id: 'some document_id',
            result_metadata: {
              collection_id: '1'
            }
          }
        ];
      });

      describe('and showTablesOnly is disabled', () => {
        beforeEach(() => {
          componentProps.showTablesOnly = false;
          ({ searchResults } = setup({ queryResults, tableResults }, componentProps));
        });

        test('the empty state text is displayed for the body result content', () => {
          expect(searchResults.getByText('Excerpt unavailable.')).toBeInTheDocument();
        });
        test('the empty state button text is displayed for the CTA button', () => {
          expect(searchResults.getByText('View document')).toBeInTheDocument();
        });
      });

      describe('and showTablesOnly is true', () => {
        beforeEach(() => {
          componentProps.showTablesOnly = true;
          ({ searchResults } = setup({ queryResults, tableResults }, componentProps));
        });

        test('the empty state text is not displayed for the body result content', () => {
          expect(searchResults.queryByText('Excerpt unavailable.')).toBe(null);
        });
        test('the empty state button text is not displayed for the CTA button', () => {
          expect(searchResults.queryByText('View document')).toBe(null);
        });
        test('noResultsFound text is displayed instead of the empty state', () => {
          expect(searchResults.getByText('No results found')).toBeInTheDocument();
        });
      });
    });

    describe('when body text only is present and there are no table results', () => {
      beforeEach(() => {
        queryResults = [
          {
            document_id: 'some document_id',
            result_metadata: {
              collection_id: '1'
            },
            text: 'I am text field.'
          }
        ];
        tableResults = [];
      });

      describe('and showTablesOnly is disabled', () => {
        beforeEach(() => {
          componentProps.showTablesOnly = false;
        });

        test('body text and not empty state text should be displayed', () => {
          ({ searchResults } = setup({ queryResults, tableResults }, componentProps));
          expect(searchResults.getByText('I am text field.')).toBeInTheDocument();
          expect(searchResults.getByText('View document')).toBeInTheDocument();
          expect(searchResults.queryByText('Excerpt unavailable.')).toBe(null);
        });
      });

      describe('and showTablesOnly is enabled', () => {
        beforeEach(() => {
          componentProps.showTablesOnly = true;
        });

        test('display noResultsFound text', () => {
          ({ searchResults } = setup({ queryResults, tableResults }, componentProps));
          expect(searchResults.queryByText('I am text field.')).toBe(null);
          expect(searchResults.queryByText('Excerpt unavailable.')).toBe(null);
          expect(searchResults.queryByText('View document')).toBe(null);
          expect(searchResults.getByText('No results found')).toBeInTheDocument();
        });
      });
    });

    describe('when body text and tableHtml are present', () => {
      beforeEach(() => {
        queryResults = [
          {
            document_id: 'some document_id',
            result_metadata: {
              collection_id: '1'
            },
            text: 'I am text field.'
          }
        ];
        tableResults = [
          {
            table_id: '558ada041262d5b0aa02a05429d798c9',
            source_document_id: 'some document_id',
            collection_id: '8713a92b-28aa-b291-0000-016ddc68aa2a',
            table_html: '<html>I am table.</html>'
          }
        ];
      });

      describe('when showTablesOnly is disabled', () => {
        beforeEach(() => {
          componentProps.showTablesOnly = false;
        });

        test('displayedText and tableHtml and not empty state text should be displayed', () => {
          ({ searchResults } = setup({ queryResults, tableResults }, componentProps));
          expect(searchResults.getByText('I am text field.')).toBeInTheDocument();
          expect(searchResults.getByText('I am table.')).toBeInTheDocument();
          expect(searchResults.getByText('View document')).toBeInTheDocument();
          expect(searchResults.queryByText('Excerpt unavailable.')).toBe(null);
        });
      });

      describe('when showTablesOnlyResults is enabled', () => {
        beforeEach(() => {
          componentProps.showTablesOnly = true;
        });

        test('tableHtml and not displayedText or empty state text should be displayed', () => {
          ({ searchResults } = setup({ queryResults, tableResults }, componentProps));
          expect(searchResults.queryByText('I am text field.')).toBe(null);
          expect(searchResults.getByText('I am table.')).toBeInTheDocument();
          expect(searchResults.queryByText('Excerpt unavailable.')).toBe(null);
          expect(searchResults.queryByText('View document')).toBe(null);
        });
      });
    });

    describe('when tableHtml only is present', () => {
      beforeEach(() => {
        queryResults = [
          {
            document_id: 'some document_id',
            result_metadata: {
              collection_id: '1'
            }
          }
        ];
        tableResults = [
          {
            table_id: '558ada041262d5b0aa02a05429d798c9',
            source_document_id: 'some document_id',
            collection_id: '8713a92b-28aa-b291-0000-016ddc68aa2a',
            table_html: '<html>I am table.</html>'
          }
        ];
      });

      describe('and showTablesOnly is disabled', () => {
        beforeEach(() => {
          componentProps.showTablesOnly = false;
        });

        test('no result should be displayed', () => {
          ({ searchResults } = setup({ queryResults, tableResults }, componentProps));
          expect(searchResults.queryByText('I am table.')).toBe(null);
          expect(searchResults.queryByText('Excerpt unavailable.')).toBe(null);
          expect(searchResults.queryByText('View document')).toBe(null);
        });
      });

      describe('and showTablesOnly is enabled', () => {
        beforeEach(() => {
          componentProps.showTablesOnly = true;
        });

        test('tableHtml and not empty state text should be displayed', () => {
          ({ searchResults } = setup({ queryResults, tableResults }, componentProps));
          expect(searchResults.getByText('I am table.')).toBeInTheDocument();
          expect(searchResults.queryByText('Excerpt unavailable.')).toBe(null);
          expect(searchResults.queryByText('View document')).toBe(null);
        });
      });
    });
  });

  describe('when showTablesOnlyToggle is undefined', () => {
    beforeEach(() => {
      componentProps.showTablesOnlyToggle = undefined;
    });

    test('does not show the showTablesOnlyToggle', () => {
      ({ searchResults } = setup({}, componentProps));
      expect(searchResults.queryAllByText('Show table results only')).toHaveLength(0);
    });

    describe('and there are tables', () => {
      beforeEach(() => {
        tableResults = [
          {
            table_id: 'table id',
            source_document_id: '123',
            collection_id: 'collection_id',
            table_html: '<div>table html</div>',
            table_html_offset: 5,
            table: {}
          }
        ];
      });

      test('shows the showTablesOnlyToggle', () => {
        ({ searchResults } = setup({ tableResults }, componentProps));
        expect(searchResults.getByText('Show table results only')).toBeInTheDocument();
      });
    });
  });

  describe('when showTablesOnlyToggle is false', () => {
    beforeEach(() => {
      componentProps.showTablesOnlyToggle = false;
    });

    test('does not show the showTablesOnlyToggle', () => {
      ({ searchResults } = setup({}, componentProps));
      expect(searchResults.queryAllByText('Show table results only')).toHaveLength(0);
    });

    describe('and there are tables', () => {
      beforeEach(() => {
        tableResults = [
          {
            table_id: 'table id',
            source_document_id: '123',
            collection_id: 'collection_id',
            table_html: '<div>table html</div>',
            table_html_offset: 5,
            table: {}
          }
        ];
      });

      test('does not show the showTablesOnlyToggle', () => {
        ({ searchResults } = setup({ tableResults }, componentProps));
        expect(searchResults.queryAllByText('Show table results only')).toHaveLength(0);
      });
    });
  });

  describe('when showTablesOnlyToggle is true', () => {
    beforeEach(() => {
      componentProps.showTablesOnlyToggle = true;
    });

    test('shows the showTablesOnlyToggle even if there are no tables', () => {
      ({ searchResults } = setup({}, componentProps));
      expect(searchResults.getByText('Show table results only')).toBeInTheDocument();
    });
  });

  describe('when showTablesOnly is true', () => {
    beforeEach(() => {
      componentProps.showTablesOnly = true;
    });

    describe('and we have table and query results', () => {
      beforeEach(() => {
        tableResults = [
          {
            table_id: 'table id',
            source_document_id: '123',
            collection_id: 'collection_id',
            table_html: '<div>table html</div>',
            table_html_offset: 5,
            table: {}
          }
        ];
        queryResults = [
          {
            document_id: '456',
            result_metadata: {
              collection_id: '1'
            },
            document_passages: [
              {
                passage_text: 'document passage text'
              }
            ]
          }
        ];
      });

      describe('and showTablesOnlyToggle is false', () => {
        beforeEach(() => {
          componentProps.showTablesOnlyToggle = false;
        });

        test('will still display the tables only results', () => {
          ({ searchResults } = setup({ queryResults, tableResults }, componentProps));
          expect(searchResults.getByText('table html')).toBeInTheDocument();
          expect(searchResults.queryByText('document passage text')).toBeNull();
        });
      });

      describe('and showTablesOnlyToggle is true', () => {
        beforeEach(() => {
          componentProps.showTablesOnlyToggle = true;
        });

        test('the value of the toggle is enabled on first render', () => {
          ({ searchResults } = setup({ queryResults, tableResults }, componentProps));
          const toggle = searchResults.getByText('Show table results only');
          expect(domGetByText(toggle, 'On')).toBeInTheDocument();
          expect(searchResults.getByText('table html')).toBeInTheDocument();
        });

        test('the user can click the toggle and see QueryResults as well', () => {
          ({ searchResults } = setup({ queryResults, tableResults }, componentProps));
          const toggle = searchResults.getByText('Show table results only');
          fireEvent.click(toggle);
          expect(searchResults.getByText('document passage text')).toBeInTheDocument();
        });
      });
    });
  });
});

describe('useUpdateQueryReturnParam', () => {
  test('should update search parameters', async () => {
    let searchParameters: QueryParams = {
      ...searchResponseStoreDefaults.parameters,
      _return: ['_extraReturnParam_']
    };
    const api: Partial<SearchApiIFC> = {
      // @ts-expect-error
      setSearchParameters: (callback: (callback: QueryParams) => QueryParams) => {
        searchParameters = callback(searchParameters);
      }
    };
    const context: Partial<SearchContextIFC> = {
      searchResponseStore: searchResponseStoreDefaults
    };
    let displaySettings: DisplaySettingsParams = {
      resultTitleField: 'titleField',
      bodyField: 'bodyField'
    };

    const wrapper = ({ children }: { children: any }) => wrapWithContext(children, api, context);

    const { rerender } = renderHook(
      () => useUpdateQueryReturnParam({ displaySettings, resultLinkField: 'linkField' }),
      {
        wrapper
      }
    );

    expect(searchParameters).toEqual({
      ...searchResponseStoreDefaults.parameters,
      _return: expect.arrayContaining([
        '_extraReturnParam_',
        'document_id',
        'document_passages',
        'extracted_metadata.filename',
        'extracted_metadata.title',
        'highlight',
        'result_metadata',
        'bodyField',
        'titleField',
        'linkField'
      ])
    });

    displaySettings = {
      resultTitleField: 'filename',
      bodyField: 'html'
    };
    rerender();

    expect(searchParameters).toEqual({
      ...searchResponseStoreDefaults.parameters,
      _return: expect.arrayContaining([
        '_extraReturnParam_',
        'document_id',
        'document_passages',
        'extracted_metadata.filename',
        'extracted_metadata.title',
        'highlight',
        'result_metadata',
        'html',
        'filename',
        'linkField'
      ])
    });
  });
});
