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

  describe('when the result has text but no bodyField', () => {
    beforeEach(() => {
      (context.searchResults as DiscoveryV1.QueryResponse).results = [
        {
          document_id: 'some document_id',
          text: 'i am text'
        }
      ];
    });

    it('displays the text', () => {
      const { getByText } = render(wrapWithContext(<SearchResults />, context));
      expect(getByText('i am text')).toBeInTheDocument();
    });
  });

  describe('when the result has text and bodyField set to "text"', () => {
    beforeEach(() => {
      (context.searchResults as DiscoveryV1.QueryResponse).results = [
        {
          document_id: 'some document_id',
          text: 'i am text'
        }
      ];
    });

    it('displays the text', () => {
      const { getByText } = render(wrapWithContext(<SearchResults bodyField={'text'} />, context));
      expect(getByText('i am text')).toBeInTheDocument();
    });
  });

  describe('when the result has text and bodyField set to "other"', () => {
    beforeEach(() => {
      (context.searchResults as DiscoveryV1.QueryResponse).results = [
        {
          document_id: 'some document_id',
          text: 'i am text',
          highlight: {
            text: ['i <em>am</em> other text']
          }
        }
      ];
    });

    it('displays the "other" text', () => {
      const { getByText } = render(
        wrapWithContext(<SearchResults bodyField={'highlight.text[0]'} />, context)
      );
      expect(
        getByText((_, element) => element.textContent === 'i am other text')
      ).toBeInTheDocument();
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

    describe('when the result prop has a title and filename property', () => {
      test('we display the title only', () => {
        const mockResult = {
          document_id: 'some document_id',
          url: {
            firstPart: 'ibm',
            secondPart: 'com'
          }
        };

        (context.searchResults as DiscoveryV1.QueryResponse).results = [
          {
            document_id: 'some document_id',
            url: {
              firstPart: 'ibm',
              secondPart: 'com'
            }
          }
        ];

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
});
