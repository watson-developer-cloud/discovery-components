import React from 'react';
import {
  render,
  fireEvent,
  getByPlaceholderText,
  getAllByLabelText,
  getByText,
  RenderResult
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { wrapWithContext } from '../../../utils/testingUtils';
import { SearchInput } from '../SearchInput';
import { SearchContextIFC } from '../../DiscoverySearch/DiscoverySearch';

const PLACE_HOLDER_TEXT = 'Type query term...';
const CLOSE_BUTTON_LABEL_TEXT = 'clear input label text';
const COMPLETIONS = ['some', 'someone', 'solar', 'somatic', 'soke'];

describe('<SearchInput />', () => {
  describe('When we type "so" into the SearchInput', () => {
    let input: HTMLInputElement;
    let container: HTMLElement;

    beforeEach(() => {
      const searchInput: RenderResult = render(
        <SearchInput
          placeHolderText={PLACE_HOLDER_TEXT}
          closeButtonLabelText={CLOSE_BUTTON_LABEL_TEXT}
        />
      );
      container = searchInput.container;
      input = getByPlaceholderText(container, PLACE_HOLDER_TEXT) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'so' } });
    });

    test('the input has value "so"', () => {
      expect(input.value).toBe('so');
    });

    describe('when we click the clear button', () => {
      let clearButton: HTMLButtonElement;

      beforeEach(() => {
        clearButton = getAllByLabelText(container, CLOSE_BUTTON_LABEL_TEXT)[0] as HTMLButtonElement;
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

    const context: Partial<SearchContextIFC> = {
      searchResults: {
        suggested_query: 'cunningham'
      }
    };
    const onSearchMock = jest.fn();
    context.onSearch = onSearchMock;
    const onUpdateQueryOptionsMock = jest.fn();
    context.onUpdateQueryOptions = onUpdateQueryOptionsMock;
    const onFetchCompletionsMock = jest.fn();
    context.onFetchAutoCompletions = onFetchCompletionsMock;

    beforeEach(() => {
      searchComponent = render(
        wrapWithContext(
          <SearchInput placeHolderText={PLACE_HOLDER_TEXT} spellingSuggestions={true} />,
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
      test('updates query', () => {
        fireEvent.change(input, { target: { value: 'cunnigham' } });
        expect((input as HTMLInputElement).value).toBe('cunnigham');

        const spellingCorrection = searchComponent.getByText('cunningham');
        fireEvent.click(spellingCorrection);
        expect((input as HTMLInputElement).value).toBe('cunningham');
      });

      test('updates nlq search param', () => {
        const spellingCorrection = searchComponent.getByText('cunningham');
        onUpdateQueryOptionsMock.mockReset();
        fireEvent.click(spellingCorrection);
        expect(onUpdateQueryOptionsMock).toBeCalledTimes(1);
        expect(onUpdateQueryOptionsMock).toBeCalledWith({
          natural_language_query: 'cunningham',
          filter: '',
          offset: 0
        });
      });

      test('calls onSearch', () => {
        const spellingCorrection = searchComponent.getByText('cunningham');
        onSearchMock.mockReset();
        fireEvent.click(spellingCorrection);
        expect(onSearchMock).toBeCalledTimes(1);
      });

      test('does not call onFetchCompletionsMock', () => {
        const spellingCorrection = searchComponent.getByText('cunningham');
        onFetchCompletionsMock.mockReset();
        fireEvent.click(spellingCorrection);
        expect(onFetchCompletionsMock).not.toBeCalled();
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

    beforeEach(() => {
      const searchInput: RenderResult = render(
        wrapWithContext(<SearchInput placeHolderText={PLACE_HOLDER_TEXT} />, context)
      );
      container = searchInput.container;
      input = getByPlaceholderText(container, PLACE_HOLDER_TEXT) as HTMLInputElement;
    });

    describe('when we type "so" into the input', () => {
      beforeEach(() => {
        fireEvent.change(input, { target: { value: 'so' } });
      });

      test('renders list of completions', () => {
        expect(getByText(container, COMPLETIONS[0])).toBeTruthy;
        expect(getByText(container, COMPLETIONS[1])).toBeTruthy;
        expect(getByText(container, COMPLETIONS[2])).toBeTruthy;
        expect(getByText(container, COMPLETIONS[3])).toBeTruthy;
        expect(getByText(container, COMPLETIONS[4])).toBeTruthy;
      });

      describe('when we focus on one of the completions', () => {
        beforeEach(() => {
          fireEvent.focus(getByText(container, COMPLETIONS[1]));
        });

        test('the search input is updated with the completions', () => {
          expect(input.value).toBe(COMPLETIONS[1]);
        });
      });

      describe('when a completion is clicked', () => {
        beforeEach(() => {
          const lastCompletion = getByText(container, COMPLETIONS[4]);
          fireEvent.focus(lastCompletion); //happens during a click, but not during fireEvent.click
          fireEvent.click(lastCompletion);
        });

        test('the input value is updated, and a space is added', () => {
          expect(input.value).toBe(`${COMPLETIONS[4]} `);
        });
      });
    });
  });
});
