import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { ExampleComponent } from '../ExampleComponent';

const setup = (propUpdates?: any) => {
  propUpdates = propUpdates || {};

  const placeholder = propUpdates.placeholder || 'Check this out';
  const exampleComponent = render(<ExampleComponent {...propUpdates} />);
  const input = exampleComponent.getByPlaceholderText(placeholder);
  const button = exampleComponent.getByText('Submit Query');
  return {
    input,
    button,
    ...exampleComponent
  };
};

describe('ExampleComponent', () => {
  describe('input element', () => {
    test('contains default placeholder', () => {
      const { input } = setup();
      expect(input).toBeDefined();
    });

    test('can provide custom placeholder', () => {
      const { input } = setup({ placeholder: 'RIGHT HERE' });
      expect(input).toBeDefined();
    });
  });

  describe('submit button', () => {
    test('exists', () => {
      const { button } = setup();
      expect(button).toBeDefined();
    });

    test('calls querySubmit action', () => {
      const querySubmitAction = jest.fn();
      const { button } = setup({ querySubmit: querySubmitAction });
      fireEvent.click(button);
      expect(querySubmitAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('autocomplete', () => {
    test('defaults to enabled', () => {
      const { input, getByText } = setup();
      fireEvent.change(input, { target: { value: 'ab' } });
      expect(getByText('ability')).toBeDefined();
    });

    test('defaults to 3 entries', () => {
      const { input, queryAllByTestId } = setup();
      fireEvent.change(input, { target: { value: 'te' } });
      expect(queryAllByTestId('suggestion')).toHaveLength(5);
    });

    test('can be disabled', async () => {
      const { input, queryByText } = setup({ suggestions: { enabled: false } });
      fireEvent.change(input, { target: { value: 'ab' } });
      const suggestion = queryByText('ability');
      expect(suggestion).toBeNull();
    });

    test('can change number suggestion returned', () => {
      const { input, queryAllByTestId } = setup({ suggestions: { enabled: true, limit: 10 } });
      fireEvent.change(input, { target: { value: 'te' } });
      expect(queryAllByTestId('suggestion')).toHaveLength(10);
    });
  });
});
