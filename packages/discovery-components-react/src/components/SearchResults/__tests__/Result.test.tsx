import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContextIFC } from '../../DiscoverySearch/DiscoverySearch';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';

import { wrapWithContext, browserWindow } from '../../../utils/testingUtils';
import { SearchResults } from '../SearchResults';

describe('<Result />', () => {
  let context: Partial<SearchContextIFC>;
  beforeEach(() => {
    context = {
      searchResults: {
        matching_results: 1,
        results: []
      }
    };
  });

  describe('on click', () => {
    test('will call onSelectResult with result as a parameter by default', () => {
      const mockResult = {
        document_id: 'some document_id'
      };
      const mockselectResult = jest.fn();
      context.onSelectResult = mockselectResult;
      (context.searchResults as DiscoveryV1.QueryResponse).results = [mockResult];
      const { getByText } = render(wrapWithContext(<SearchResults />, context));
      fireEvent.click(getByText('some document_id'));
      expect(mockselectResult.mock.calls.length).toBe(1);
      expect(mockselectResult.mock.calls[0][0]).toBe(mockResult);
    });
  });

  describe('when usePassages is set to true', () => {
    test('will render the first passage if it exists', () => {
      (context.searchResults as DiscoveryV1.QueryResponse).results = [
        {
          document_id: 'some document_id',
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
      const { getByText } = render(wrapWithContext(<SearchResults usePassages={true} />, context));
      expect(getByText('this is the first passage text')).toBeInTheDocument();
    });

    test('will render the bodyField if first passage doesnt exist', () => {
      (context.searchResults as DiscoveryV1.QueryResponse).results = [
        {
          document_id: 'some document_id',
          document_passages: [],
          text: 'this is the bodyField text'
        }
      ];
      const { getByText } = render(wrapWithContext(<SearchResults usePassages={true} />, context));
      expect(getByText('this is the bodyField text')).toBeInTheDocument();
    });
  });

  describe('when usePassages is set to false', () => {
    describe('and there is a value at bodyField', () => {
      it('displays the bodyField text', () => {
        (context.searchResults as DiscoveryV1.QueryResponse).results = [
          {
            document_id: 'some document_id',
            text: 'i am text',
            highlight: {
              text: ['i <em>am</em> other text']
            }
          }
        ];
        const { getByText } = render(
          wrapWithContext(
            <SearchResults bodyField={'highlight.text[0]'} usePassages={false} />,
            context
          )
        );
        expect(
          getByText((_, element) => element.textContent === 'i am other text')
        ).toBeInTheDocument();
      });
    });
    describe('and bodyField is undefined', () => {
      beforeEach(() => {
        (context.searchResults as DiscoveryV1.QueryResponse).results = [
          {
            document_id: 'some document_id',
            text: 'i am text'
          }
        ];
      });

      it('displays the default bodyField value', () => {
        const { getByText } = render(
          wrapWithContext(<SearchResults usePassages={false} />, context)
        );
        expect(getByText('i am text')).toBeInTheDocument();
      });
    });
  });

  describe('when usePassages is null', () => {
    test('will render the first passage if it exists', () => {
      (context.searchResults as DiscoveryV1.QueryResponse).results = [
        {
          document_id: 'some document_id',
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
      const { getByText } = render(wrapWithContext(<SearchResults />, context));
      expect(getByText('this is the first passage text')).toBeInTheDocument();
    });

    describe('and there are no passages in the result object', () => {
      describe('and there is a value for bodyField', () => {
        it('displays the bodyField text', () => {
          (context.searchResults as DiscoveryV1.QueryResponse).results = [
            {
              document_id: 'some document_id',
              text: 'i am text',
              highlight: {
                text: ['i <em>am</em> other text']
              }
            }
          ];
          const { getByText } = render(
            wrapWithContext(<SearchResults bodyField={'highlight.text[0]'} />, context)
          );
          expect(
            getByText((_, element) => element.textContent === 'i am other text')
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe('When there is a value for resultLinkField', () => {
    describe('on click', () => {
      test('will not call onSelectResult', () => {
        const mockResult = {
          document_id: 'some document_id'
        };
        (context.searchResults as DiscoveryV1.QueryResponse).results = [mockResult];
        context.onSelectResult = jest.fn();
        const { getByText } = render(
          wrapWithContext(<SearchResults resultLinkField={'url'} />, context)
        );
        fireEvent.click(getByText('some document_id'));
        expect((context.onSelectResult as jest.Mock).mock.calls.length).toBe(0);
      });
      describe('when resultLinkField is a top level value on the result object', () => {
        test('will open a new window with the correct value', () => {
          browserWindow.open = jest.fn();
          const urlValue = 'https://www.ibm.com';

          (context.searchResults as DiscoveryV1.QueryResponse).results = [
            {
              document_id: 'some document_id',
              url: urlValue
            }
          ];

          const { getByText } = render(
            wrapWithContext(<SearchResults resultLinkField={'url'} />, context)
          );
          fireEvent.click(getByText('some document_id'));
          expect(browserWindow.open.mock.calls[0][0]).toBe(urlValue);
        });
      });
      describe('when resultLinkField is a nested value on the result object', () => {
        test('will open a new window with the correct value', () => {
          browserWindow.open = jest.fn();
          const urlValue = 'https://www.ibm.com';

          (context.searchResults as DiscoveryV1.QueryResponse).results = [
            {
              document_id: 'some document_id',
              url: { value: urlValue }
            }
          ];

          const { getByText } = render(
            wrapWithContext(<SearchResults resultLinkField={'url.value'} />, context)
          );
          fireEvent.click(getByText('some document_id'));
          expect(browserWindow.open.mock.calls[0][0]).toBe(urlValue);
        });
      });
    });
  });

  describe('when there is a value for resultLinkTemplate', () => {
    describe('on click', () => {
      test('will not call onSelectResult', () => {
        const mockResult = {
          document_id: 'some document_id',
          url: {
            firstPart: 'ibm',
            secondPart: 'com'
          }
        };
        context.onSelectResult = jest.fn();
        (context.searchResults as DiscoveryV1.QueryResponse).results = [mockResult];
        const { getByText } = render(
          wrapWithContext(
            <SearchResults resultLinkTemplate={'https://{{url.firstPart}}.{{url.secondPart}}'} />,
            context
          )
        );
        fireEvent.click(getByText('some document_id'));
        expect((context.onSelectResult as jest.Mock).mock.calls.length).toBe(0);
      });

      test('will open a new window with the correct value', () => {
        browserWindow.open = jest.fn();
        (context.searchResults as DiscoveryV1.QueryResponse).results = [
          {
            document_id: 'some document_id',
            url: {
              firstPart: 'ibm',
              secondPart: 'com'
            }
          }
        ];
        const { getByText } = render(
          wrapWithContext(
            <SearchResults
              resultLinkTemplate={'https://www.{{url.firstPart}}.{{url.secondPart}}'}
            />,
            context
          )
        );
        fireEvent.click(getByText('some document_id'));
        expect(browserWindow.open.mock.calls[0][0]).toBe('https://www.ibm.com');
      });
    });
  });

  describe('when there is a value for resultTitleField', () => {
    test('we display the value at that property', () => {
      (context.searchResults as DiscoveryV1.QueryResponse).results = [
        {
          document_id: 'some document_id',
          extracted_metadata: {
            title: 'some title',
            filename: 'some file name'
          },
          myTitle: 'my title'
        }
      ];

      context.onSelectResult = jest.fn();
      const { getByText } = render(
        wrapWithContext(<SearchResults resultTitleField="myTitle" />, context)
      );
      expect(getByText('my title')).toBeInTheDocument();
    });
  });

  describe('when the result prop has a title and filename property', () => {
    test('we display the title', () => {
      (context.searchResults as DiscoveryV1.QueryResponse).results = [
        {
          document_id: 'some document_id',
          extracted_metadata: {
            title: 'some title',
            filename: 'some file name'
          }
        }
      ];

      context.onSelectResult = jest.fn();
      const { getByText } = render(wrapWithContext(<SearchResults />, context));
      expect(getByText('some title')).toBeInTheDocument();
    });
  });

  describe('when the result prop has a title but no filename property', () => {
    test('we display title only', () => {
      (context.searchResults as DiscoveryV1.QueryResponse).results = [
        {
          document_id: 'some document_id',
          extracted_metadata: {
            title: 'some title'
          }
        }
      ];

      const { getByText } = render(wrapWithContext(<SearchResults />, context));
      expect(getByText('some title')).toBeInTheDocument();
    });
  });

  describe('when the result prop has a filename but no title property', () => {
    test('we display filename only', () => {
      (context.searchResults as DiscoveryV1.QueryResponse).results = [
        {
          document_id: 'some document_id',
          extracted_metadata: {
            filename: 'some file name'
          }
        }
      ];
      const { getByText } = render(wrapWithContext(<SearchResults />, context));
      expect(getByText('some file name')).toBeInTheDocument();
    });
  });

  describe('when the result prop has no filename or title property', () => {
    test('we display the document_id once', () => {
      (context.searchResults as DiscoveryV1.QueryResponse).results = [
        {
          document_id: 'some document_id'
        }
      ];
      const { getByText } = render(wrapWithContext(<SearchResults />, context));
      expect(getByText('some document_id')).toBeInTheDocument();
    });
  });

  describe('when collectionLabel is passed as a param', () => {
    test('will render', () => {
      (context.searchResults as DiscoveryV1.QueryResponse).results = [
        {
          document_id: 'some document_id',
          collection_id: '123',
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
      const { getByText } = render(
        wrapWithContext(<SearchResults collectionLabel={'my label'} />, context)
      );
      expect(getByText(/.*my label/)).toBeInTheDocument();
    });
  });

  describe('when there are collectionsResults stored in context', () => {
    test('renders the collectionName', () => {
      (context.searchResults as DiscoveryV1.QueryResponse).results = [
        {
          document_id: 'some document_id',
          collection_id: '123',
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
      const { getByText } = render(wrapWithContext(<SearchResults />, context));
      expect(getByText(/.*test collection/)).toBeInTheDocument();
    });
  });
});
