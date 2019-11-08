import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContextIFC, SearchApiIFC } from '../../DiscoverySearch/DiscoverySearch';
import { wrapWithContext } from '../../../utils/testingUtils';
import { SearchResults } from '../SearchResults';

describe('<SearchResults />', () => {
  describe('When we have a value for matching_results', () => {
    describe('which is greater than 0', () => {
      const context: Partial<SearchContextIFC> = {
        searchResponse: {
          matching_results: 1,
          results: [
            {
              document_id: 'some document_id'
            }
          ]
        }
      };
      test('renders the results', () => {
        const { getByText } = render(wrapWithContext(<SearchResults />, {}, context));
        expect(getByText('some document_id')).toBeInTheDocument();
      });
    });

    describe('which is equal to 0', () => {
      const context: Partial<SearchContextIFC> = {
        searchResponse: {
          matching_results: 0,
          results: []
        }
      };
      test('renders the no results found message', () => {
        const { getByText } = render(wrapWithContext(<SearchResults />, {}, context));
        expect(getByText('There were no results found')).toBeInTheDocument();
      });

      describe('and we have a spelling suggestion', () => {
        beforeEach(() => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          context.searchResponse!.suggested_query = 'suggested';
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

  describe('When we do not have results', () => {
    const context: Partial<SearchContextIFC> = {
      searchResponse: null
    };
    // TODO: include when we have loading states in our repo
    // describe('And we are in the middle of fetching query_results', () => {
    //   test('renders the loading spinner', () => {});
    // });
    describe('And we are not in the middle of fetching query_results', () => {
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
      // TODO: how to assert an anonymous function's return value?
      // expect.objectContaining({
      //   passages: { characters: 20, enabled: true }
      // })
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
      searchResponse: {
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
});
