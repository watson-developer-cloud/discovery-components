/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';
import { render, fireEvent, RenderResult } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {
  SearchContextIFC,
  SearchApiIFC,
  searchResponseStoreDefaults
} from '../../DiscoverySearch/DiscoverySearch';
import { wrapWithContext } from '../../../utils/testingUtils';
import { SearchResults } from '../SearchResults';

describe('<SearchResults />', () => {
  describe('When we have a value for matching_results', () => {
    describe('which is greater than 0', () => {
      const context: Partial<SearchContextIFC> = {
        searchResponseStore: {
          ...searchResponseStoreDefaults,
          data: {
            matching_results: 1,
            results: [
              {
                document_id: 'some document_id'
              }
            ]
          }
        }
      };
      test('renders the results', () => {
        const { getByText } = render(wrapWithContext(<SearchResults />, {}, context));
        expect(getByText('some document_id')).toBeInTheDocument();
      });
    });

    describe('which is equal to 0', () => {
      const context: Partial<SearchContextIFC> = {
        searchResponseStore: {
          ...searchResponseStoreDefaults,
          data: {
            matching_results: 0,
            results: []
          }
        }
      };
      test('renders the no results found message', () => {
        const { getByText } = render(wrapWithContext(<SearchResults />, {}, context));
        expect(getByText('There were no results found')).toBeInTheDocument();
      });

      describe('and we have a spelling suggestion', () => {
        beforeEach(() => {
          context.searchResponseStore!.data!.suggested_query = 'suggested';
        });
        test('renders the spelling suggestion', () => {
          const { getByText } = render(wrapWithContext(<SearchResults />, {}, context));
          expect(
            getByText((_, element) => {
              return element.textContent === 'suggested';
            })
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe('when we have table_results', () => {
    describe('and showTablesOnlyResults is enabled', () => {
      describe('and the number of table_results is greater than 0', () => {
        const context: Partial<SearchContextIFC> = {
          searchResponseStore: {
            ...searchResponseStoreDefaults,
            data: {
              matching_results: 1,
              results: [
                {
                  document_id: 'some document_id'
                }
              ],
              table_results: [
                {
                  table_id: '558ada041262d5b0aa02a05429d798c9',
                  source_document_id: 'some document_id',
                  collection_id: '8713a92b-28aa-b291-0000-016ddc68aa2a',
                  table_html: '<html>I am table.</html>'
                }
              ]
            }
          }
        };
        test('the table results are rendered', () => {
          const { getByText } = render(
            wrapWithContext(<SearchResults showTablesOnlyToggle={true} />, {}, context)
          );
          fireEvent.click(getByText('Show table results only'));
          expect(getByText('I am table.')).toBeInTheDocument();
        });
      });

      describe('and table_results is empty', () => {
        const context: Partial<SearchContextIFC> = {
          searchResponseStore: {
            ...searchResponseStoreDefaults,
            data: {
              matching_results: 1,
              results: [
                {
                  document_id: 'some document_id'
                }
              ],
              table_results: []
            }
          }
        };
        test('renders the no results found message', () => {
          const { getByText } = render(
            wrapWithContext(<SearchResults showTablesOnlyToggle={true} />, {}, context)
          );
          fireEvent.click(getByText('Show table results only'));
          expect(getByText('There were no results found')).toBeInTheDocument();
        });
      });
    });
  });

  describe('When we do not have results', () => {
    const context: Partial<SearchContextIFC> = {
      searchResponseStore: { ...searchResponseStoreDefaults, data: null }
    };

    describe('and results are loading', () => {
      beforeEach(() => {
        context.searchResponseStore!.isLoading = true;
      });

      test('renders the skeleton text', () => {
        const { getAllByTestId } = render(wrapWithContext(<SearchResults />, {}, context));
        expect(getAllByTestId('skeleton_text')).toHaveLength(3);
      });

      describe('and count has been set lower than 5', () => {
        beforeEach(() => {
          context.searchResponseStore!.parameters!.count = 2;
        });

        test('renders fewer skeleton text', () => {
          const { getAllByTestId } = render(wrapWithContext(<SearchResults />, {}, context));
          expect(getAllByTestId('skeleton_text')).toHaveLength(2);
        });
      });
    });

    describe('And we are not in the middle of fetching query_results', () => {
      beforeEach(() => {
        context.searchResponseStore!.isLoading = false;
      });

      test('renders only the header', () => {
        const { getAllByTestId } = render(wrapWithContext(<SearchResults />, {}, context));
        expect(getAllByTestId('search_results_header')).toHaveLength(1);
      });
    });
  });

  describe('when passageLength is defined', () => {
    test('onUpdatePassageLength is called with the expected character count', () => {
      const setSearchParametersMock = jest.fn();
      const context: Partial<SearchContextIFC> = {};
      const api: Partial<SearchApiIFC> = {
        setSearchParameters: setSearchParametersMock
      };
      render(wrapWithContext(<SearchResults passageLength={20} />, api, context));
      expect(setSearchParametersMock).toBeCalledTimes(1);
      expect(setSearchParametersMock).toBeCalledWith(expect.any(Function));
      const returnFunc = setSearchParametersMock.mock.calls[0][0];
      const returnValue = returnFunc();
      expect(returnValue).toEqual(
        expect.objectContaining({
          passages: { characters: 20, enabled: true }
        })
      );
    });
  });

  describe('when passageLength is not defined', () => {
    test('onUpdatePassageLength is not called', () => {
      const setSearchParametersMock = jest.fn();
      const context: Partial<SearchContextIFC> = {};
      const api: Partial<SearchApiIFC> = {
        setSearchParameters: setSearchParametersMock
      };
      render(wrapWithContext(<SearchResults />, api, context));
      expect(setSearchParametersMock).toBeCalledTimes(0);
    });
  });

  describe('when there are component settings in context', () => {
    const context: Partial<SearchContextIFC> = {
      componentSettings: {
        fields_shown: {
          body: {
            use_passage: true
          },
          title: {
            field: 'titleField'
          }
        }
      },
      searchResponseStore: {
        ...searchResponseStoreDefaults,
        data: {
          matching_results: 1,
          results: [
            {
              document_id: 'document_id',
              titleField: 'this title comes from the titleField',
              document_passages: [
                {
                  passage_text: 'this is the first passage text'
                }
              ],
              overwrittenTitleField: 'this title comes from the overwritten title field',
              overwrittenBodyField: 'this body text comes from the overwritten body field'
            }
          ]
        }
      }
    };
    const api: Partial<SearchApiIFC> = {};

    describe('and none of those settings are overwritten as props on SearchResults', () => {
      test('should render with component settings', () => {
        const { getByText } = render(wrapWithContext(<SearchResults />, api, context));
        expect(getByText('this is the first passage text')).toBeInTheDocument();
        expect(getByText('this title comes from the titleField')).toBeInTheDocument();
      });
    });

    describe('and some of those settings are overwritten as props on SearchResults', () => {
      test('should render with the overwritten properties', () => {
        const { getByText } = render(
          wrapWithContext(
            <SearchResults
              usePassages={false}
              bodyField={'overwrittenBodyField'}
              resultTitleField={'overwrittenTitleField'}
            />,
            api,
            context
          )
        );
        expect(getByText('this title comes from the overwritten title field')).toBeInTheDocument();
        expect(
          getByText('this body text comes from the overwritten body field')
        ).toBeInTheDocument();
      });
    });
  });

  describe('the empty result state', () => {
    describe('when there is no table result, no passage, bodyField is not specified, and there is no text field but there is a result for a document', () => {
      let context: Partial<SearchContextIFC>;
      beforeEach(() => {
        context = {
          searchResponseStore: {
            ...searchResponseStoreDefaults,
            data: {
              matching_results: 1,
              results: [
                {
                  document_id: 'some document_id'
                }
              ],
              table_results: []
            }
          }
        };
      });

      describe('and showTablesOnlyResults is disabled', () => {
        let searchResults: RenderResult;
        beforeEach(() => {
          searchResults = render(wrapWithContext(<SearchResults />, {}, context));
        });
        test('the empty state text is displayed for the body result content', () => {
          expect(searchResults.getByText('Excerpt unavailable.')).toBeInTheDocument();
        });
        test('the empty state button text is displayed for the CTA button', () => {
          expect(searchResults.getByText('View result')).toBeInTheDocument();
        });
      });

      describe('and showTablesOnlyResults is enabled', () => {
        let searchResults: RenderResult;
        beforeEach(() => {
          searchResults = render(
            wrapWithContext(<SearchResults showTablesOnlyToggle={true} />, {}, context)
          );
          const toggle = searchResults.getByText('Show table results only');
          fireEvent.click(toggle);
        });
        test('the empty state text is not displayed for the body result content', () => {
          expect(searchResults.queryByText('Excerpt unavailable.')).toBe(null);
        });
        test('the empty state button text is not displayed for the CTA button', () => {
          expect(searchResults.queryByText('View result')).toBe(null);
        });
        test('noResultsFound text is displayed instead of the empty state', () => {
          expect(searchResults.getByText('There were no results found')).toBeInTheDocument();
        });
      });
    });

    describe('when displayedText only is present and no table results', () => {
      let context: Partial<SearchContextIFC>;
      beforeEach(() => {
        context = {
          searchResponseStore: {
            ...searchResponseStoreDefaults,
            data: {
              matching_results: 1,
              results: [
                {
                  document_id: 'some document_id',
                  text: 'I am text field.'
                }
              ],
              table_results: []
            }
          }
        };
      });

      describe('and showTablesOnlyResults is disabled', () => {
        test('displayedText and not empty state text should be displayed', () => {
          const { getByText, queryByText } = render(
            wrapWithContext(<SearchResults />, {}, context)
          );
          expect(getByText('I am text field.')).toBeInTheDocument();
          expect(queryByText('Excerpt unavailable.')).toBe(null);
          expect(queryByText('View result')).toBe(null);
        });
      });

      describe('and showTablesOnlyResults is enabled', () => {
        test('neither displayedText nor empty state should render but noResultsFound text should', () => {
          const { getByText, queryByText } = render(
            wrapWithContext(<SearchResults showTablesOnlyToggle={true} />, {}, context)
          );
          const toggle = getByText('Show table results only');
          fireEvent.click(toggle);
          expect(queryByText('I am text field.')).toBe(null);
          expect(queryByText('Excerpt unavailable.')).toBe(null);
          expect(queryByText('View result')).toBe(null);
          expect(getByText('There were no results found')).toBeInTheDocument();
        });
      });
    });

    describe('when displayedText and tableHtml is present', () => {
      let context: Partial<SearchContextIFC>;
      beforeEach(() => {
        context = {
          searchResponseStore: {
            ...searchResponseStoreDefaults,
            data: {
              matching_results: 1,
              results: [
                {
                  document_id: 'some document_id',
                  text: 'I am text field.'
                }
              ],
              table_results: [
                {
                  table_id: '558ada041262d5b0aa02a05429d798c9',
                  source_document_id: 'some document_id',
                  collection_id: '8713a92b-28aa-b291-0000-016ddc68aa2a',
                  table_html: '<html>I am table.</html>'
                }
              ]
            }
          }
        };
      });

      describe('when showTablesOnlyResults is disabled', () => {
        test('displayedText and tableHtml and not empty state text should be displayed', () => {
          const { getByText, queryByText } = render(
            wrapWithContext(<SearchResults />, {}, context)
          );
          expect(getByText('I am text field.')).toBeInTheDocument();
          expect(getByText('I am table.')).toBeInTheDocument();
          expect(queryByText('Excerpt unavailable.')).toBe(null);
          expect(queryByText('View result')).toBe(null);
        });
      });

      describe('when showTablesOnlyResults is enabled', () => {
        test('tableHtml and not displayedText or empty state text should be displayed', () => {
          const { getByText, queryByText } = render(
            wrapWithContext(<SearchResults showTablesOnlyToggle={true} />, {}, context)
          );
          const toggle = getByText('Show table results only');
          fireEvent.click(toggle);
          expect(queryByText('I am text field.')).toBe(null);
          expect(getByText('I am table.')).toBeInTheDocument();
          expect(queryByText('Excerpt unavailable.')).toBe(null);
          expect(queryByText('View result')).toBe(null);
        });
      });
    });

    describe('when tableHtml only is present', () => {
      let context: Partial<SearchContextIFC>;
      beforeEach(() => {
        context = {
          searchResponseStore: {
            ...searchResponseStoreDefaults,
            data: {
              matching_results: 1,
              results: [
                {
                  document_id: 'some document_id'
                }
              ],
              table_results: [
                {
                  table_id: '558ada041262d5b0aa02a05429d798c9',
                  source_document_id: 'some document_id',
                  collection_id: '8713a92b-28aa-b291-0000-016ddc68aa2a',
                  table_html: '<html>I am table.</html>'
                }
              ]
            }
          }
        };
      });

      describe('and showTablesOnlyResults is disabled', () => {
        test('tableHtml and not empty state text should be displayed', () => {
          const { getByText, queryByText } = render(
            wrapWithContext(<SearchResults />, {}, context)
          );
          expect(getByText('I am table.')).toBeInTheDocument();
          expect(queryByText('Excerpt unavailable.')).toBe(null);
          expect(queryByText('View result')).toBe(null);
        });
      });

      describe('and showTablesOnlyResults is enabled', () => {
        test('tableHtml and not empty state text should be displayed', () => {
          const { getByText, queryByText } = render(
            wrapWithContext(<SearchResults showTablesOnlyToggle={true} />, {}, context)
          );
          const toggle = getByText('Show table results only');
          fireEvent.click(toggle);
          expect(getByText('I am table.')).toBeInTheDocument();
          expect(queryByText('Excerpt unavailable.')).toBe(null);
          expect(queryByText('View result')).toBe(null);
        });
      });
    });
  });
});
