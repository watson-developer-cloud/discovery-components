import React from 'react';
import {
  render,
  fireEvent,
  getByPlaceholderText,
  getAllByLabelText,
  getByText,
  RenderResult,
  getByTestId,
  getAllByText,
  queryByTestId,
  waitForElementToBeRemoved
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContextIFC, SearchApiIFC } from '../../DiscoverySearch/DiscoverySearch';
import { wrapWithContext } from '../../../utils/testingUtils';
import { SearchInput } from '../SearchInput';

const PLACE_HOLDER_TEXT = 'Type query term...';
const CLOSE_BUTTON_LABEL_TEXT = 'clear input label text';
const COMPLETIONS = ['some', 'someone', 'solar', 'somatic', 'soke'];
const SEARCHINPUTVALUE = 'so';
const expectNoCompletionsDropdown = (container: HTMLElement): void => {
  expect(queryByTestId(container, 'completions-dropdown-test-id')).toBeNull();
};

describe('<SearchInput />', () => {
  describe('When we type "so" into the SearchInput', () => {
    let input: HTMLInputElement;
    let container: HTMLElement;

    beforeEach(() => {
      const searchInput: RenderResult = render(
        <SearchInput
          placeHolderText={PLACE_HOLDER_TEXT}
          closeButtonLabelText={CLOSE_BUTTON_LABEL_TEXT}
          id="search-input-test-id"
        />
      );
      container = searchInput.container;
      input = getByPlaceholderText(container, PLACE_HOLDER_TEXT) as HTMLInputElement;
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: SEARCHINPUTVALUE } });
    });

    test('the input has value "so"', () => {
      expect(input.value).toBe(SEARCHINPUTVALUE);
    });

    describe('when we click the clear button', () => {
      let clearButton: HTMLButtonElement;

      beforeEach(() => {
        clearButton = getAllByLabelText(container, CLOSE_BUTTON_LABEL_TEXT)[0] as HTMLButtonElement;
        fireEvent.focus(clearButton);
        fireEvent.click(clearButton);
      });

      test('the input text is cleared', () => {
        expect(input.value).toBe('');
      });
    });
  });

  describe('When spelling suggestions enabled', () => {
    let searchComponent: RenderResult;
    let input: HTMLElement;
    const performSearchMock = jest.fn();
    const setSearchParametersMock = jest.fn();
    const fetchAutocompletionsMock = jest.fn();

    const context: Partial<SearchContextIFC> = {
      searchResponse: {
        suggested_query: 'cunningham'
      }
    };
    const api: Partial<SearchApiIFC> = {
      performSearch: performSearchMock,
      setSearchParameters: setSearchParametersMock,
      fetchAutocompletions: fetchAutocompletionsMock
    };

    beforeEach(() => {
      searchComponent = render(
        wrapWithContext(
          <SearchInput placeHolderText={PLACE_HOLDER_TEXT} spellingSuggestions={true} />,
          api,
          context
        )
      );
      input = searchComponent.getByPlaceholderText(PLACE_HOLDER_TEXT);
    });

    test('renders suggestion message', () => {
      const correctionMessage = searchComponent.getByText('Did you mean:');
      expect(correctionMessage).toBeDefined();
    });

    test('renders spelling suggestion', () => {
      const spellingCorrection = searchComponent.getByText('cunningham');
      expect(spellingCorrection).toBeDefined();
    });

    describe('clicking on suggestion', () => {
      let spellingCorrection: HTMLElement;
      beforeEach(() => {
        // set the input value
        fireEvent.change(input, { target: { value: 'cunnigham' } });
        expect((input as HTMLInputElement).value).toBe('cunnigham');

        // reset the mock methods
        performSearchMock.mockReset();
        fetchAutocompletionsMock.mockReset();

        // click on the suggestion
        spellingCorrection = searchComponent.getByText('cunningham');
        fireEvent.focus(spellingCorrection);
        fireEvent.click(spellingCorrection);
      });

      test('updates query', () => {
        expect((input as HTMLInputElement).value).toBe('cunningham');
      });

      test('calls performSearch', () => {
        expect(performSearchMock).toBeCalledTimes(1);
        expect(performSearchMock).toBeCalledWith(
          expect.objectContaining({
            naturalLanguageQuery: 'cunningham',
            filter: '',
            offset: 0
          })
        );
      });

      test('does not call fetchAutocompletionsMock', () => {
        expect(fetchAutocompletionsMock).not.toBeCalled();
      });
    });
  });

  describe('When we have completions', () => {
    let container: HTMLElement;
    let input: HTMLInputElement;

    const context: Partial<SearchContextIFC> = {
      autocompletionResults: {
        completions: COMPLETIONS
      }
    };

    describe('when we have component settings', () => {
      context.componentSettings = {
        autocomplete: false
      };
      describe('and there are no display parameters passed on SearchInput', () => {
        beforeEach(() => {
          const searchInput: RenderResult = render(
            wrapWithContext(<SearchInput placeHolderText={PLACE_HOLDER_TEXT} />, {}, context)
          );
          container = searchInput.container;
          input = getByPlaceholderText(container, PLACE_HOLDER_TEXT) as HTMLInputElement;
        });
        describe('when we type "so" into the input', () => {
          beforeEach(() => {
            fireEvent.focus(input);
            fireEvent.change(input, { target: { value: SEARCHINPUTVALUE } });
          });

          test('no autocompletions are displayed', () => {
            expectNoCompletionsDropdown(container);
          });
        });
      });
      describe('and there are some display parameters passed on SearchInput', () => {
        describe('when showAutocomplete is true', () => {
          beforeEach(() => {
            const searchInput: RenderResult = render(
              wrapWithContext(
                <SearchInput placeHolderText={PLACE_HOLDER_TEXT} showAutocomplete={true} />,
                {},
                context
              )
            );
            container = searchInput.container;
            input = getByPlaceholderText(container, PLACE_HOLDER_TEXT) as HTMLInputElement;
          });

          describe('when we type "so" into the input', () => {
            let completionsDropdown: HTMLElement;
            beforeEach(() => {
              fireEvent.focus(input);
              fireEvent.change(input, { target: { value: SEARCHINPUTVALUE } });
              completionsDropdown = getByTestId(container, 'completions-dropdown-test-id');
            });

            test('renders list of completions', () => {
              // since current value is in a <strong>, look for all iterations of that, then each of the suffixes separately
              expect(getAllByText(completionsDropdown, SEARCHINPUTVALUE).length).toBe(
                COMPLETIONS.length
              );
              COMPLETIONS.forEach(completion => {
                const suffix = completion.slice(SEARCHINPUTVALUE.length); // everything after 'so'
                expect(getByText(container, suffix)).toBeTruthy();
              });
            });
          });
        });

        describe('when showAutocomplete is false', () => {
          beforeEach(() => {
            const searchInput: RenderResult = render(
              wrapWithContext(
                <SearchInput placeHolderText={PLACE_HOLDER_TEXT} showAutocomplete={false} />,
                {},
                context
              )
            );
            container = searchInput.container;
            input = getByPlaceholderText(container, PLACE_HOLDER_TEXT) as HTMLInputElement;
          });

          describe('when we type "so" into the input', () => {
            beforeEach(() => {
              fireEvent.focus(input);
              fireEvent.change(input, { target: { value: SEARCHINPUTVALUE } });
            });

            test('no autocompletions are displayed', () => {
              expectNoCompletionsDropdown(container);
            });
          });
        });
      });
    });

    describe('when showAutocomplete is true', () => {
      beforeEach(() => {
        const searchInput: RenderResult = render(
          wrapWithContext(
            <SearchInput placeHolderText={PLACE_HOLDER_TEXT} showAutocomplete={true} />,
            {},
            context
          )
        );
        container = searchInput.container;
        input = getByPlaceholderText(container, PLACE_HOLDER_TEXT) as HTMLInputElement;
      });

      describe('when we type "so" into the input', () => {
        let completionsDropdown: HTMLElement;
        beforeEach(() => {
          fireEvent.focus(input);
          fireEvent.change(input, { target: { value: SEARCHINPUTVALUE } });
          completionsDropdown = getByTestId(container, 'completions-dropdown-test-id');
        });

        test('renders list of completions', () => {
          // since current value is in a <strong>, look for all iterations of that, then each of the suffixes separately
          expect(getAllByText(completionsDropdown, SEARCHINPUTVALUE).length).toBe(
            COMPLETIONS.length
          );
          COMPLETIONS.forEach(completion => {
            const suffix = completion.slice(2); // everything after 'so'
            expect(getByText(container, suffix)).toBeTruthy();
          });
        });

        describe('when we focus on one of the completions', () => {
          beforeEach(() => {
            fireEvent.focus(getByText(container, COMPLETIONS[1].slice(2)));
          });

          describe('when we hit the Enter key', () => {
            beforeEach(() => {
              fireEvent.keyUp(getByText(container, COMPLETIONS[1].slice(2)), {
                key: 'Enter',
                code: 13
              });
            });

            test('the search input is updated with the completion, and a space is added', () => {
              expect(input.value).toBe(`${COMPLETIONS[1]} `);
            });
          });
        });

        describe('when a completion is clicked', () => {
          beforeEach(() => {
            const lastCompletion = getByText(container, COMPLETIONS[4].slice(2));
            fireEvent.focus(lastCompletion); //happens during a click, but not during fireEvent.click
            fireEvent.click(lastCompletion);
          });

          test('the input value is updated, and a space is added', () => {
            expect(input.value).toBe(`${COMPLETIONS[4]} `);
          });
        });

        describe('when the SearchInput is no longer focused', () => {
          beforeEach(() => {
            fireEvent.blur(getByTestId(container, 'search-input-test-id'));
          });

          test('the completions dropdown disappears', () => {
            waitForElementToBeRemoved(() =>
              queryByTestId(container, 'completions-dropdown-test-id')
            ).then(() => {
              expectNoCompletionsDropdown(container);
            });
          });
        });
      });

      describe('When we type "this is so" into the Search input', () => {
        let completionsDropdown: HTMLElement;
        beforeEach(() => {
          fireEvent.focus(input);
          fireEvent.change(input, { target: { value: 'this is so' } });
          completionsDropdown = getByTestId(container, 'completions-dropdown-test-id');
        });

        test('the completions all start with "this is so"', () => {
          const thisIsArray = getAllByText(completionsDropdown, 'this is so');
          expect(thisIsArray.length).toBe(5);
        });

        test('the completions end with the correct suggestions', () => {
          COMPLETIONS.forEach(completion => {
            const suffix = completion.slice(2);
            expect(getByText(completionsDropdown, suffix)).toBeTruthy();
          });
        });
      });
    });

    describe('when showAutocomplete is false', () => {
      beforeEach(() => {
        const searchInput: RenderResult = render(
          wrapWithContext(
            <SearchInput placeHolderText={PLACE_HOLDER_TEXT} showAutocomplete={false} />,
            {},
            context
          )
        );
        container = searchInput.container;
        input = getByPlaceholderText(container, PLACE_HOLDER_TEXT) as HTMLInputElement;
      });

      describe('when we type "so" into the input', () => {
        beforeEach(() => {
          fireEvent.focus(input);
          fireEvent.change(input, { target: { value: SEARCHINPUTVALUE } });
        });

        test('no autocompletions are displayed', () => {
          expectNoCompletionsDropdown(container);
        });
      });
    });
  });
});
