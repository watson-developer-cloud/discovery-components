/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';
import { render, fireEvent, RenderResult } from '@testing-library/react';
import {
  searchResponseStoreDefaults,
  fetchDocumentsResponseStoreDefaults
} from 'components/DiscoverySearch/DiscoverySearch';
import { QueryResult, QueryTableResult, Collection } from 'ibm-watson/discovery/v2';
import { SearchContextIFC } from 'components/DiscoverySearch/DiscoverySearch';

import { wrapWithContext, browserWindow } from 'utils/testingUtils';
import SearchResults, { SearchResultsProps } from 'components/SearchResults/SearchResults';

interface Setup {
  searchResults: RenderResult;
  selectResultMock: jest.Mock;
  onSelectResult: jest.Mock;
}

function setup(
  {
    queryResults,
    tableResults,
    collectionsResults,
    fetchDocumentsResponseStore
  }: {
    queryResults?: QueryResult[];
    tableResults?: QueryTableResult[];
    collectionsResults?: Collection[];
    fetchDocumentsResponseStore?: any;
  },
  componentProps: Partial<SearchResultsProps> = {}
): Setup {
  const api = { setSelectedResult: jest.fn() };
  let context: Partial<SearchContextIFC> = {
    searchResponseStore: {
      ...searchResponseStoreDefaults,
      data: {
        matching_results: 1,
        results: queryResults,
        table_results: tableResults
      }
    },
    fetchDocumentsResponseStore: {
      ...fetchDocumentsResponseStoreDefaults,
      ...fetchDocumentsResponseStore
    },
    collectionsResults: {
      collections: collectionsResults
    }
  };
  const searchResults = render(
    wrapWithContext(<SearchResults {...componentProps} />, api, context)
  );
  return {
    searchResults,
    selectResultMock: api.setSelectedResult,
    onSelectResult: api.setSelectedResult
  };
}

describe('<Result />', () => {
  let selectResultMock: jest.Mock;
  let searchResults: RenderResult;
  let queryResults: QueryResult[] | undefined;
  let tableResults: QueryTableResult[] | undefined;
  let collectionsResults: Collection[] | undefined;
  let fetchDocumentsResponseStore: any;
  let componentProps: Partial<SearchResultsProps> = {};
  let onSelectResult: jest.Mock;

  beforeEach(() => {
    browserWindow.open = jest.fn();
  });

  afterEach(() => {
    queryResults = undefined;
    tableResults = undefined;
    collectionsResults = undefined;
    componentProps = {};
    fetchDocumentsResponseStore = undefined;
  });

  describe('when there is a QueryResult available in searchResponseStore', () => {
    beforeEach(() => {
      queryResults = [
        {
          document_id: 'some document_id',
          text: 'body text'
        } as unknown as QueryResult
      ];
    });

    describe('and usePassages is set to true', () => {
      beforeEach(() => {
        componentProps.usePassages = true;
      });

      describe('when there are no passages', () => {
        beforeEach(() => {
          queryResults![0].document_passages = undefined;
        });

        test('will render the bodyField', () => {
          ({ searchResults } = setup({ queryResults }, componentProps));
          expect(searchResults.getByText('body text')).toBeInTheDocument();
        });
      });
    });

    describe('and usePassages is set to false', () => {
      beforeEach(() => {
        componentProps.usePassages = false;
      });

      describe('and there is a value on the QueryResult highlight property', () => {
        beforeEach(() => {
          queryResults![0].highlight = {
            text: ['<div><h1>This is a header</h1><p>This is some text</p></div>']
          };
        });

        describe('and the bodyFieldProp points to that highlight property', () => {
          beforeEach(() => {
            componentProps.bodyField = 'highlight.text[0]';
          });

          test('displays the bodyField text', () => {
            ({ searchResults } = setup({ queryResults }, componentProps));
            expect(
              searchResults.getByText(
                (_, element) =>
                  element?.textContent ===
                  '<div><h1>This is a header</h1><p>This is some text</p></div>'
              )
            ).toBeInTheDocument();
          });

          describe('and dangerouslyRenderHtml is set to true', () => {
            beforeEach(() => {
              componentProps.dangerouslyRenderHtml = true;
            });

            test('renders the bodyField as cleaned html elements', () => {
              ({ searchResults } = setup({ queryResults }, componentProps));
              expect(searchResults.getByText('This is a header')).toBeInTheDocument();
              expect(searchResults.getByText('This is some text')).toBeInTheDocument();
              expect(
                searchResults.queryByText(
                  '<div><h1>This is a header</h1><p>This is some text</p></div>'
                )
              ).toBe(null);
            });
          });
        });
      });

      describe('and bodyField is undefined', () => {
        beforeEach(() => {
          componentProps.bodyField = undefined;
        });

        test('displays the default bodyField value', () => {
          ({ searchResults } = setup({ queryResults }, componentProps));
          expect(searchResults.getByText('body text')).toBeInTheDocument();
        });
      });
    });

    describe('and usePassages is undefined', () => {
      beforeEach(() => {
        componentProps.usePassages = undefined;
      });

      describe('and there are no passages on the result object', () => {
        beforeEach(() => {
          queryResults![0].document_passages = undefined;
        });

        describe('and there is a value for bodyField', () => {
          beforeEach(() => {
            componentProps.bodyField = 'text';
          });

          test('displays the bodyField text', () => {
            ({ searchResults } = setup({ queryResults }, componentProps));
            expect(searchResults.getByText('body text')).toBeInTheDocument();
          });
        });
      });
    });

    describe('on result click', () => {
      beforeEach(() => {
        componentProps.onSelectResult = jest.fn();
        ({ selectResultMock, searchResults, onSelectResult } = setup(
          { queryResults },
          componentProps
        ));
        fireEvent.click(searchResults.getByText('View document'));
      });

      test('will call onSelectResult with result and no element as parameters by default', () => {
        expect(selectResultMock.mock.calls.length).toBe(1);
        expect(selectResultMock.mock.calls[0][0].document).toBe(queryResults![0]);
        expect(selectResultMock.mock.calls[0][0].element).toBe(null);
        expect(selectResultMock.mock.calls[0][0].elementType).toBe(null);
        expect(onSelectResult.mock.calls[0][0].document).toBe(queryResults![0]);
      });
    });

    describe('and there is a passage available on that QueryResult', () => {
      beforeEach(() => {
        queryResults = [
          {
            ...queryResults![0],
            document_passages: [
              {
                passage_text: 'this is the first passage text'
              }
            ]
          }
        ];
      });

      describe('and usePassages is undefined', () => {
        beforeEach(() => {
          componentProps.usePassages = undefined;
        });

        test('will render the first passage', () => {
          ({ searchResults } = setup({ queryResults }, componentProps));
          expect(searchResults.getByText('this is the first passage text')).toBeInTheDocument();
        });
      });

      describe('on passage click', () => {
        beforeEach(() => {
          ({ selectResultMock, searchResults } = setup({ queryResults }));
          fireEvent.click(searchResults.getByText('View passage in document'));
        });

        test('will call onSelectResult with result and passage element and element type as parameters', () => {
          expect(selectResultMock.mock.calls.length).toBe(1);
          expect(selectResultMock.mock.calls[0][0].document).toBe(queryResults![0]);
          expect(selectResultMock.mock.calls[0][0].element).toBe(
            queryResults![0].document_passages![0]
          );
          expect(selectResultMock.mock.calls[0][0].elementType).toBe('passage');
        });
      });

      describe('and there is a tableResult available in searchResponseStore', () => {
        beforeEach(() => {
          tableResults = [
            {
              table_id: '558ada041262d5b0aa02a05429d798c7',
              source_document_id: 'some document_id',
              collection_id: '8713a92b-28aa-b291-0000-016ddc68aa2a',
              table_html:
                '<table style="width:100%"><tr><th>Firstname</th><th>Lastname</th><th>Age</th></tr><tr><td>Jane</td><td>Smith</td><td>50</td></tr><tr><td>Eve</td><td>Jackson</td><td>94</td></tr></table>'
            }
          ];
        });

        describe('on result passage click', () => {
          beforeEach(() => {
            ({ selectResultMock, searchResults } = setup({ queryResults, tableResults }));
            fireEvent.click(searchResults.getByText('View table in document'));
          });

          test('will call onSelectResult with result and table element and element type as parameters', () => {
            expect(selectResultMock.mock.calls[0][0].document).toBe(queryResults![0]);
            expect(selectResultMock.mock.calls[0][0].element).toBe(tableResults![0]);
            expect(selectResultMock.mock.calls[0][0].elementType).toBe('table');
          });
        });
      });

      describe('and usePassages is set to true', () => {
        beforeEach(() => {
          componentProps.usePassages = true;
        });

        test('will render the first passage if it exists', () => {
          ({ searchResults } = setup({ queryResults }, componentProps));
          expect(searchResults.getByText('this is the first passage text')).toBeInTheDocument();
        });

        describe('and passage_text contains html', () => {
          beforeEach(() => {
            queryResults![0].document_passages![0].passage_text =
              '<div><h1>This is a header</h1><p>This is some text</p></div>';
          });

          describe('and dangerouslyRenderHtml is true', () => {
            beforeEach(() => {
              componentProps.dangerouslyRenderHtml = true;
            });

            test('will dangerously render the passages if they exist', () => {
              ({ searchResults } = setup({ queryResults }, componentProps));
              expect(searchResults.getByText('This is a header')).toBeInTheDocument();
              expect(searchResults.getByText('This is some text')).toBeInTheDocument();
              expect(
                searchResults.queryByText(
                  '<div><h1>This is a header</h1><p>This is some text</p></div>'
                )
              ).toBe(null);
            });
          });

          describe('and dangerouslyRenderHtml is false', () => {
            beforeEach(() => {
              componentProps.dangerouslyRenderHtml = false;
            });

            test('will render the passage as cleaned html', () => {
              ({ searchResults } = setup({ queryResults }, componentProps));
              expect(searchResults.getByText('This is a header')).toBeInTheDocument();
              expect(searchResults.getByText('This is some text')).toBeInTheDocument();
              expect(
                searchResults.queryByText(
                  '<div><h1>This is a header</h1><p>This is some text</p></div>'
                )
              ).toBe(null);
            });
          });
        });
      });
    });

    describe('when there is a value for resultLinkField', () => {
      const urlValue = 'https://www.ibm.com';
      beforeEach(() => {
        componentProps.resultLinkField = 'url';
      });

      describe('on click', () => {
        beforeEach(() => {
          ({ searchResults, selectResultMock } = setup({ queryResults }, componentProps));
          fireEvent.click(searchResults.getByText('some document_id'));
        });

        test('will not call setSelectedResult', () => {
          expect(selectResultMock.mock.calls.length).toBe(0);
        });
      });

      describe('when resultLinkField is a top level value on the result object', () => {
        beforeEach(() => {
          queryResults![0].url = urlValue;
        });

        describe('on click', () => {
          beforeEach(() => {
            ({ searchResults, selectResultMock } = setup({ queryResults }, componentProps));
            fireEvent.click(searchResults.getByText('View document'));
          });

          test('will open a new window with the correct value', () => {
            expect(browserWindow.open.mock.calls[0][0]).toBe(urlValue);
          });
        });
      });

      describe('when resultLinkField is a nested value on the result object', () => {
        beforeEach(() => {
          queryResults![0].url = { value: urlValue };
        });

        describe('and the value of resultLinkField points to that nested field', () => {
          beforeEach(() => {
            componentProps.resultLinkField = 'url.value';
          });

          describe('on click', () => {
            beforeEach(() => {
              ({ searchResults } = setup({ queryResults }, componentProps));
              fireEvent.click(searchResults.getByText('View document'));
            });

            test('will open a new window with the correct value', () => {
              expect(browserWindow.open.mock.calls[0][0]).toBe(urlValue);
            });
          });
        });
      });
    });

    describe('when there is a value for resultLinkTemplate', () => {
      beforeEach(() => {
        componentProps.resultLinkTemplate = 'https://www.{{url.firstPart}}.{{url.secondPart}}';
      });

      describe('and there are corresponding values on the QueryResult object', () => {
        beforeEach(() => {
          queryResults![0].url = { firstPart: 'ibm', secondPart: 'com' };
        });

        describe('on click', () => {
          beforeEach(() => {
            ({ searchResults, selectResultMock } = setup({ queryResults }, componentProps));
            browserWindow.open = jest.fn();
            fireEvent.click(searchResults.getByText('View document'));
          });

          test('will not call setSelectedResult', () => {
            expect(selectResultMock.mock.calls.length).toBe(0);
          });

          test('will open a new window with the correct value', () => {
            expect(browserWindow.open.mock.calls[0][0]).toBe('https://www.ibm.com');
          });
        });
      });
    });

    describe('when there is a value for resultTitleField', () => {
      beforeEach(() => {
        componentProps.resultTitleField = 'myTitle';
      });

      describe('and there is a corresponding value on the QueryResult object', () => {
        beforeEach(() => {
          queryResults![0].myTitle = 'my title';
        });

        test('we display the value at that property', () => {
          ({ searchResults } = setup({ queryResults }, componentProps));
          expect(searchResults.getByText('my title')).toBeInTheDocument();
        });
      });

      describe('but there is no corresponding value on the QueryResult object', () => {
        beforeEach(() => {
          queryResults![0].myTitle = undefined;
        });

        test('displays the value of document_id by default', () => {
          ({ searchResults } = setup({ queryResults }, componentProps));
          expect(searchResults.getByText('some document_id')).toBeInTheDocument();
        });

        describe('but there is a value at extracted_metadata.title', () => {
          beforeEach(() => {
            queryResults![0].extracted_metadata = { title: 'some title' };
          });

          test('we display the value at extracted_metadata.title', () => {
            ({ searchResults } = setup({ queryResults }, componentProps));
            expect(searchResults.getByText('some title')).toBeInTheDocument();
          });
        });

        describe('but there is a value for extracted_metadata.filename and document_id', () => {
          beforeEach(() => {
            queryResults![0].extracted_metadata = { filename: 'my file name' };
            queryResults![0].document_id = 'some document_id';
          });

          test('displays the filename', () => {
            ({ searchResults } = setup({ queryResults }, componentProps));
            expect(searchResults.getByText('my file name')).toBeInTheDocument();
          });
        });
      });
    });

    describe('when the result prop has a title and filename property', () => {
      beforeEach(() => {
        queryResults![0].extracted_metadata = {
          title: 'some title',
          filename: 'some file name'
        };
      });

      test('we display the title', () => {
        ({ searchResults } = setup({ queryResults }, componentProps));
        expect(searchResults.getByText('some title')).toBeInTheDocument();
      });
    });

    describe('when the result prop has a title but no filename property', () => {
      beforeEach(() => {
        queryResults![0].extracted_metadata = { title: 'some title' };
      });

      test('we display title only', () => {
        ({ searchResults } = setup({ queryResults }));
        expect(searchResults.getByText('some title')).toBeInTheDocument();
      });
    });

    describe('when the result prop has a filename but no title property', () => {
      beforeEach(() => {
        queryResults![0].extracted_metadata = {
          filename: 'some file name'
        };
      });

      test('we display filename only', () => {
        ({ searchResults } = setup({ queryResults }));
        expect(searchResults.getByText('some file name')).toBeInTheDocument();
      });
    });

    describe('when the result prop has no filename or title property', () => {
      beforeEach(() => {
        queryResults![0].extracted_metadata = {
          filename: undefined,
          title: undefined
        };
      });

      test('we display the document_id once', () => {
        ({ searchResults } = setup({ queryResults }));
        expect(searchResults.getByText('some document_id')).toBeInTheDocument();
      });
    });

    describe('when there is collection information on the QueryResult object', () => {
      beforeEach(() => {
        queryResults![0].result_metadata = { collection_id: `123` };
      });

      describe('and corresponding collection information within collectionsResults', () => {
        beforeEach(() => {
          collectionsResults = [
            {
              collection_id: '123',
              name: 'test collection'
            }
          ];
        });

        test('renders the collectionName', () => {
          ({ searchResults } = setup({ queryResults, collectionsResults }));
          expect(searchResults.getByText(/.*test collection/)).toBeInTheDocument();
        });
      });
    });

    describe('when there are tableResults', () => {
      beforeEach(() => {
        tableResults = [
          {
            table_id: '558ada041262d5b0aa02a05429d798c7',
            source_document_id: '123',
            collection_id: '8713a92b-28aa-b291-0000-016ddc68aa2a',
            table_html:
              '<table style="width:100%"><tr><th>Firstname</th><th>Lastname</th><th>Age</th></tr><tr><td>Jane</td><td>Smith</td><td>50</td></tr><tr><td>Eve</td><td>Jackson</td><td>94</td></tr></table>'
          }
        ];
      });

      describe('and there is a corresponding QueryResult whose document_id matches the table result source_document_id', () => {
        beforeEach(() => {
          queryResults = [
            {
              document_id: '123',
              result_metadata: {
                collection_id: '123'
              },
              document_passages: [
                {
                  passage_text: 'this is the first passage text'
                }
              ],
              extracted_metadata: {
                title: 'document title'
              }
            }
          ];
        });

        test('renders result title', () => {
          ({ searchResults } = setup({ tableResults, queryResults }));
          expect(searchResults.getByText('document title')).toBeInTheDocument();
        });

        describe('and showTablesOnlyToggle is enabled', () => {
          beforeEach(() => {
            componentProps.showTablesOnlyToggle = true;
          });

          describe('on click', () => {
            beforeEach(() => {
              ({ searchResults } = setup({ queryResults, tableResults }, componentProps));
              const toggle = searchResults.getByText('Show table results only');
              fireEvent.click(toggle);
            });

            test('renders result title', () => {
              expect(searchResults.getByText('document title')).toBeInTheDocument();
            });

            test('renders "View table in document" button', () => {
              expect(searchResults.getByText('View table in document')).toBeInTheDocument();
            });
          });
        });
      });

      describe('and there is no QueryResult whose document_id matches the table result source_document_id', () => {
        describe('and showTablesOnlyToggle is enabled', () => {
          beforeEach(() => {
            componentProps.showTablesOnlyToggle = true;
          });

          describe('and documents are being fetched', () => {
            beforeEach(() => {
              fetchDocumentsResponseStore = { isLoading: true };
            });

            describe('on toggle click', () => {
              beforeEach(() => {
                ({ searchResults } = setup(
                  {
                    queryResults,
                    tableResults,
                    fetchDocumentsResponseStore
                  },
                  componentProps
                ));
                const toggle = searchResults.getByText('Show table results only');
                fireEvent.click(toggle);
              });

              test('renders the skeleton loading text', () => {
                expect(searchResults.getByTestId('result-title-skeleton')).toBeInTheDocument();
              });
            });
          });

          describe('on toggle click', () => {
            beforeEach(() => {
              ({ searchResults } = setup({ queryResults, tableResults }, componentProps));
              const toggle = searchResults.getByText('Show table results only');
              fireEvent.click(toggle);
            });

            test('renders the skeleton loading text', () => {
              expect(searchResults.getByTestId('result-title-skeleton')).toBeInTheDocument();
            });
          });
        });
      });
    });
  });
});
