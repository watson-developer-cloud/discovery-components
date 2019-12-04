/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';
import { render, fireEvent, RenderResult } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {
  SearchContextIFC,
  searchResponseStoreDefaults,
  fetchDocumentsResponseStoreDefaults
} from '@DiscoverySearch/DiscoverySearch';
import DiscoveryV2 from 'ibm-watson/discovery/v2';

import { wrapWithContext, browserWindow } from '@rootUtils/testingUtils';
import { SearchResults } from '@SearchResults/SearchResults';

describe('<Result />', () => {
  let context: Partial<SearchContextIFC>;
  beforeEach(() => {
    context = {
      searchResponseStore: {
        ...searchResponseStoreDefaults,
        data: {
          matching_results: 1,
          results: []
        }
      },
      fetchDocumentsResponseStore: {
        ...fetchDocumentsResponseStoreDefaults
      }
    };
  });

  describe('on result click', () => {
    test('will call onSelectResult with result and no element as parameters by default', () => {
      const mockSelectResult = jest.fn();
      const mockResult = {
        document_id: 'some document_id',
        result_metadata: {
          collection_id: '1'
        },
        text: 'body text'
      };
      const api = {
        setSelectedResult: mockSelectResult
      };
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      context.searchResponseStore!.data!.results = [mockResult];
      const { getByText } = render(wrapWithContext(<SearchResults />, api, context));
      fireEvent.click(getByText('View document'));
      expect(mockSelectResult.mock.calls.length).toBe(1);
      expect(mockSelectResult.mock.calls[0][0].document).toBe(mockResult);
      expect(mockSelectResult.mock.calls[0][0].element).toBe(null);
      expect(mockSelectResult.mock.calls[0][0].elementType).toBe(null);
    });
  });

  describe('on result passage click', () => {
    test('will call onSelectResult with result and passage element and element type as parameters', () => {
      const mockSelectResult = jest.fn();
      (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [
        {
          document_id: 'some document_id',
          result_metadata: {
            collection_id: '1'
          },
          document_passages: [
            {
              passage_text: 'this is the passage text'
            }
          ]
        }
      ];
      const api = {
        setSelectedResult: mockSelectResult
      };
      const { getByText } = render(wrapWithContext(<SearchResults />, api, context));
      fireEvent.click(getByText('View passage in document'));
      expect(mockSelectResult.mock.calls.length).toBe(1);
      expect(mockSelectResult.mock.calls[0][0].document).toBe(
        context.searchResponseStore!.data!.results![0]
      );
      expect(mockSelectResult.mock.calls[0][0].element).toBe(
        context.searchResponseStore!.data!.results![0].document_passages![0]
      );
      expect(mockSelectResult.mock.calls[0][0].elementType).toBe('passage');
    });

    test('will call onSelectResult with result and table element and element type as parameters', () => {
      const mockSelectResult = jest.fn();
      (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [
        {
          document_id: 'some document_id',
          result_metadata: {
            collection_id: '1'
          },
          document_passages: [
            {
              passage_text: 'this is the passage text'
            }
          ]
        }
      ];
      (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).table_results = [
        {
          table_id: '558ada041262d5b0aa02a05429d798c7',
          source_document_id: 'some document_id',
          collection_id: '8713a92b-28aa-b291-0000-016ddc68aa2a',
          table_html:
            '<table style="width:100%"><tr><th>Firstname</th><th>Lastname</th><th>Age</th></tr><tr><td>Jane</td><td>Smith</td><td>50</td></tr><tr><td>Eve</td><td>Jackson</td><td>94</td></tr></table>'
        }
      ];
      const api = {
        setSelectedResult: mockSelectResult
      };
      const { getByText } = render(wrapWithContext(<SearchResults />, api, context));
      fireEvent.click(getByText('View table in document'));
      expect(mockSelectResult.mock.calls[0][0].document).toBe(
        context.searchResponseStore!.data!.results![0]
      );
      expect(mockSelectResult.mock.calls[0][0].element).toBe(
        context.searchResponseStore!.data!.table_results![0]
      );
      expect(mockSelectResult.mock.calls[0][0].elementType).toBe('table');
    });
  });

  describe('when usePassages is set to true', () => {
    test('will render the first passage if it exists', () => {
      (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [
        {
          document_id: 'some document_id',
          result_metadata: {
            collection_id: '1'
          },
          document_passages: [
            {
              passage_text: 'this is the first passage text'
            },
            {
              passage_text: 'this is the second passage text'
            }
          ]
        }
      ];
      const { getByText } = render(
        wrapWithContext(<SearchResults usePassages={true} />, {}, context)
      );
      expect(getByText('this is the first passage text')).toBeInTheDocument();
    });

    test('will render the bodyField if first passage doesnt exist', () => {
      (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [
        {
          document_id: 'some document_id',
          result_metadata: {
            collection_id: '1'
          },
          document_passages: [],
          text: 'this is the bodyField text'
        }
      ];
      const { getByText } = render(
        wrapWithContext(<SearchResults usePassages={true} />, {}, context)
      );
      expect(getByText('this is the bodyField text')).toBeInTheDocument();
    });

    it('will dangerously render the passages if they exist', () => {
      (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [
        {
          document_id: 'some document_id',
          result_metadata: {
            collection_id: '1'
          },
          document_passages: [
            {
              passage_text: '<div><h1>This is a header</h1><p>This is some text</p></div>'
            }
          ]
        }
      ];
      const resultsWithPassages = render(
        wrapWithContext(
          <SearchResults usePassages={true} dangerouslyRenderHtml={true} />,
          {},
          context
        )
      );

      expect(resultsWithPassages.getByText('This is a header')).toBeInTheDocument;
      expect(resultsWithPassages.getByText('This is some text')).toBeInTheDocument;
      expect(
        resultsWithPassages.queryByText(
          '<div><h1>This is a header</h1><p>This is some text</p></div>'
        )
      ).toBe(null);
    });

    describe('and dangerouslyRenderHtml is set to false', () => {
      let resultsWithPassages: RenderResult;
      beforeEach(() => {
        (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [
          {
            document_id: 'some document_id',
            result_metadata: {
              collection_id: '1'
            },
            document_passages: [
              {
                passage_text: '<div><h1>This is a header</h1><p>This is some text</p></div>'
              }
            ]
          }
        ];
        resultsWithPassages = render(
          wrapWithContext(
            <SearchResults usePassages={true} dangerouslyRenderHtml={false} />,
            {},
            context
          )
        );
      });

      it('will render the passage as cleaned html', () => {
        expect(resultsWithPassages.getByText('This is a header')).toBeInTheDocument;
        expect(resultsWithPassages.getByText('This is some text')).toBeInTheDocument;
        expect(
          resultsWithPassages.queryByText(
            '<div><h1>This is a header</h1><p>This is some text</p></div>'
          )
        ).toBe(null);
      });
    });
  });

  describe('when usePassages is set to false', () => {
    describe('and there is a value at bodyField', () => {
      it('displays the bodyField text', () => {
        (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [
          {
            document_id: 'some document_id',
            result_metadata: {
              collection_id: '1'
            },
            text: 'i am text',
            highlight: {
              text: ['i <em>am</em> other text']
            }
          }
        ];
        const { getByText } = render(
          wrapWithContext(
            <SearchResults bodyField={'highlight.text[0]'} usePassages={false} />,
            {},
            context
          )
        );
        expect(
          getByText((_, element) => element.textContent === 'i <em>am</em> other text')
        ).toBeInTheDocument();
      });

      describe('and dangerouslyRenderHtml is set to true', () => {
        let results: RenderResult;

        beforeEach(() => {
          (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [
            {
              document_id: 'some document_id',
              result_metadata: {
                collection_id: '1'
              },
              text: 'i am text',
              highlight: {
                text: ['<div><h1>This is a header</h1><p>This is some text</p></div>']
              }
            }
          ];
          results = render(
            wrapWithContext(
              <SearchResults
                bodyField={'highlight.text[0]'}
                usePassages={false}
                dangerouslyRenderHtml={true}
              />,
              {},
              context
            )
          );
        });

        it('renders the bodyField as cleaned html elements', () => {
          expect(results.getByText('This is a header')).toBeInTheDocument;
          expect(results.getByText('This is some text')).toBeInTheDocument;
          expect(
            results.queryByText('<div><h1>This is a header</h1><p>This is some text</p></div>')
          ).toBe(null);
        });
      });

      describe('and dangerouslyRenderHtml is set to false', () => {
        let results: RenderResult;

        beforeEach(() => {
          (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [
            {
              document_id: 'some document_id',
              result_metadata: {
                collection_id: '1'
              },
              text: 'i am text',
              highlight: {
                text: ['i <em>am</em> other text']
              }
            }
          ];
          results = render(
            wrapWithContext(
              <SearchResults
                bodyField={'highlight.text[0]'}
                usePassages={false}
                dangerouslyRenderHtml={false}
              />,
              {},
              context
            )
          );
        });

        it('renders the bodyField text as the original string', () => {
          expect(results.getByText('i <em>am</em> other text')).toBeInTheDocument();
        });
      });
    });

    describe('and bodyField is undefined', () => {
      beforeEach(() => {
        (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [
          {
            document_id: 'some document_id',
            result_metadata: {
              collection_id: '1'
            },
            text: 'i am text'
          }
        ];
      });

      it('displays the default bodyField value', () => {
        const { getByText } = render(
          wrapWithContext(<SearchResults usePassages={false} />, {}, context)
        );
        expect(getByText('i am text')).toBeInTheDocument();
      });
    });
  });

  describe('when usePassages is null', () => {
    test('will render the first passage if it exists', () => {
      (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [
        {
          document_id: 'some document_id',
          result_metadata: {
            collection_id: '1'
          },
          document_passages: [
            {
              passage_text: 'this is the first passage text'
            },
            {
              passage_text: 'this is the second passage text'
            }
          ]
        }
      ];
      const { getByText } = render(wrapWithContext(<SearchResults />, {}, context));
      expect(getByText('this is the first passage text')).toBeInTheDocument();
    });

    describe('and there are no passages in the result object', () => {
      describe('and there is a value for bodyField', () => {
        it('displays the bodyField text', () => {
          (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [
            {
              document_id: 'some document_id',
              result_metadata: {
                collection_id: '1'
              },
              text: 'i am text',
              highlight: {
                text: ['i <em>am</em> other text']
              }
            }
          ];
          const { getByText } = render(
            wrapWithContext(<SearchResults bodyField={'highlight.text[0]'} />, {}, context)
          );
          expect(
            getByText((_, element) => element.textContent === 'i <em>am</em> other text')
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe('When there is a value for resultLinkField', () => {
    describe('on click', () => {
      test('will not call setSelectedResult', () => {
        const mockResult = {
          document_id: 'some document_id',
          result_metadata: {
            collection_id: '1'
          }
        };
        (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [mockResult];
        const api = {
          setSelectedResult: jest.fn()
        };
        const { getByText } = render(
          wrapWithContext(<SearchResults resultLinkField={'url'} />, api, context)
        );
        fireEvent.click(getByText('some document_id'));
        expect((api.setSelectedResult as jest.Mock).mock.calls.length).toBe(0);
      });
      describe('when resultLinkField is a top level value on the result object', () => {
        test('will open a new window with the correct value', () => {
          browserWindow.open = jest.fn();
          const urlValue = 'https://www.ibm.com';

          (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [
            {
              document_id: 'some document_id',
              result_metadata: {
                collection_id: '1'
              },
              url: urlValue,
              text: 'body text'
            }
          ];

          const { getByText } = render(
            wrapWithContext(<SearchResults resultLinkField={'url'} />, {}, context)
          );
          fireEvent.click(getByText('View document'));
          expect(browserWindow.open.mock.calls[0][0]).toBe(urlValue);
        });
      });
      describe('when resultLinkField is a nested value on the result object', () => {
        test('will open a new window with the correct value', () => {
          browserWindow.open = jest.fn();
          const urlValue = 'https://www.ibm.com';

          (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [
            {
              document_id: 'some document_id',
              result_metadata: {
                collection_id: '1'
              },
              url: { value: urlValue },
              text: 'body text'
            }
          ];

          const { getByText } = render(
            wrapWithContext(<SearchResults resultLinkField={'url.value'} />, {}, context)
          );
          fireEvent.click(getByText('View document'));
          expect(browserWindow.open.mock.calls[0][0]).toBe(urlValue);
        });
      });
    });
  });

  describe('when there is a value for resultLinkTemplate', () => {
    describe('on click', () => {
      test('will not call setSelectedResult', () => {
        const mockResult = {
          document_id: 'some document_id',
          result_metadata: {
            collection_id: '1'
          },
          url: {
            firstPart: 'ibm',
            secondPart: 'com'
          }
        };
        const api = {
          setSelectedResult: jest.fn()
        };
        (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [mockResult];
        const { getByText } = render(
          wrapWithContext(
            <SearchResults resultLinkTemplate={'https://{{url.firstPart}}.{{url.secondPart}}'} />,
            api,
            context
          )
        );
        fireEvent.click(getByText('some document_id'));
        expect((api.setSelectedResult as jest.Mock).mock.calls.length).toBe(0);
      });

      test('will open a new window with the correct value', () => {
        browserWindow.open = jest.fn();
        (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [
          {
            document_id: 'some document_id',
            result_metadata: {
              collection_id: '1'
            },
            url: {
              firstPart: 'ibm',
              secondPart: 'com'
            },
            text: 'body text'
          }
        ];
        const { getByText } = render(
          wrapWithContext(
            <SearchResults
              resultLinkTemplate={'https://www.{{url.firstPart}}.{{url.secondPart}}'}
            />,
            {},
            context
          )
        );
        fireEvent.click(getByText('View document'));
        expect(browserWindow.open.mock.calls[0][0]).toBe('https://www.ibm.com');
      });
    });
  });

  describe('when there is a value for resultTitleField', () => {
    test('we display the value at that property', () => {
      (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [
        {
          document_id: 'some document_id',
          result_metadata: {
            collection_id: '1'
          },
          extracted_metadata: {
            title: 'some title',
            filename: 'some file name'
          },
          myTitle: 'my title'
        }
      ];
      const api = {
        setSelectedResult: jest.fn()
      };
      const { getByText } = render(
        wrapWithContext(<SearchResults resultTitleField="myTitle" />, api, context)
      );
      expect(getByText('my title')).toBeInTheDocument();
    });
  });

  describe('when the result prop has a title and filename property', () => {
    test('we display the title', () => {
      (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [
        {
          document_id: 'some document_id',
          result_metadata: {
            collection_id: '1'
          },
          extracted_metadata: {
            title: 'some title',
            filename: 'some file name'
          }
        }
      ];
      const api = {
        setSelectedResult: jest.fn()
      };
      const { getByText } = render(wrapWithContext(<SearchResults />, api, context));
      expect(getByText('some title')).toBeInTheDocument();
    });
  });

  describe('when the result prop has a title but no filename property', () => {
    test('we display title only', () => {
      (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [
        {
          document_id: 'some document_id',
          result_metadata: {
            collection_id: '1'
          },
          extracted_metadata: {
            title: 'some title'
          }
        }
      ];

      const { getByText } = render(wrapWithContext(<SearchResults />, {}, context));
      expect(getByText('some title')).toBeInTheDocument();
    });
  });

  describe('when the result prop has a filename but no title property', () => {
    test('we display filename only', () => {
      (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [
        {
          document_id: 'some document_id',
          result_metadata: {
            collection_id: '1'
          },
          extracted_metadata: {
            filename: 'some file name'
          }
        }
      ];
      const { getByText } = render(wrapWithContext(<SearchResults />, {}, context));
      expect(getByText('some file name')).toBeInTheDocument();
    });
  });

  describe('when the result prop has no filename or title property', () => {
    test('we display the document_id once', () => {
      (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [
        {
          document_id: 'some document_id',
          result_metadata: {
            collection_id: '1'
          }
        }
      ];
      const { getByText } = render(wrapWithContext(<SearchResults />, {}, context));
      expect(getByText('some document_id')).toBeInTheDocument();
    });
  });

  describe('when there are collectionsResults stored in context', () => {
    test('renders the collectionName', () => {
      (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [
        {
          document_id: 'some document_id',
          result_metadata: {
            collection_id: '123'
          },
          document_passages: [
            {
              passage_text: 'this is the first passage text'
            }
          ]
        }
      ];
      context.collectionsResults = {
        collections: [
          {
            collection_id: '123',
            name: 'test collection'
          }
        ]
      };
      const { getByText } = render(wrapWithContext(<SearchResults />, {}, context));
      expect(getByText(/.*test collection/)).toBeInTheDocument();
    });
  });

  describe('when rendering a table Result', () => {
    beforeEach(() => {
      (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).table_results = [
        {
          table_id: '558ada041262d5b0aa02a05429d798c7',
          source_document_id: '123',
          collection_id: '8713a92b-28aa-b291-0000-016ddc68aa2a',
          table_html:
            '<table style="width:100%"><tr><th>Firstname</th><th>Lastname</th><th>Age</th></tr><tr><td>Jane</td><td>Smith</td><td>50</td></tr><tr><td>Eve</td><td>Jackson</td><td>94</td></tr></table>'
        }
      ];
    });

    describe('and there is a corresponding QueryResult', () => {
      beforeEach(() => {
        (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [
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
        const api = {};
        const { getByText } = render(
          wrapWithContext(<SearchResults showTablesOnlyToggle />, api, context)
        );
        expect(getByText('document title')).toBeInTheDocument();
      });

      describe('and showOnlyTables is enabled', () => {
        let renderResult: RenderResult;
        beforeEach(() => {
          const api = {};
          renderResult = render(
            wrapWithContext(<SearchResults showTablesOnlyToggle />, api, context)
          );
          const toggle = renderResult.getByText('Show table results only');
          fireEvent.click(toggle);
        });

        test('renders result title', () => {
          const { getByText } = renderResult;
          expect(getByText('document title')).toBeInTheDocument();
        });

        test('renders "View table in document" button', () => {
          const { getByText } = renderResult;
          expect(getByText('View table in document')).toBeInTheDocument();
        });
      });
    });

    describe('and there is no corresponding QueryResult', () => {
      beforeEach(() => {
        (context.searchResponseStore!.data as DiscoveryV2.QueryResponse).results = [
          {
            document_id: 'some document_id',
            result_metadata: {
              collection_id: '123'
            },
            document_passages: [
              {
                passage_text: 'this is the first passage text'
              }
            ]
          }
        ];
      });

      test('renders the skeleton loading text', () => {
        const api = {};
        const { getByTestId, getByText } = render(
          wrapWithContext(<SearchResults showTablesOnlyToggle />, api, context)
        );
        const toggle = getByText('Show table results only');
        fireEvent.click(toggle);
        expect(getByTestId('result-title-skeleton')).toBeInTheDocument();
      });

      describe('and the documents are being fetched', () => {
        beforeEach(() => {
          context.fetchDocumentsResponseStore!.isLoading = true;
        });

        test('will render the Skeleton loading text', () => {
          const api = {};
          const { getByTestId, getByText } = render(
            wrapWithContext(<SearchResults showTablesOnlyToggle />, api, context)
          );
          const toggle = getByText('Show table results only');
          fireEvent.click(toggle);
          expect(getByTestId('result-title-skeleton')).toBeInTheDocument();
        });
      });
    });
  });
});
