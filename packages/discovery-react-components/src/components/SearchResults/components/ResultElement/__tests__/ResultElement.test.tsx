import React from 'react';
import { render } from '@testing-library/react';
import { ResultElement, ResultElementProps } from '../ResultElement';

const props: ResultElementProps = {
  body: 'body text',
  element: {},
  elementType: 'table',
  handleSelectResult: () => {
    return () => {};
  },
  buttonText: 'button text',
  hasResult: true
};

describe('<ResultElement />', () => {
  describe('when hasResult is true', () => {
    test('will render an enabled preview button', () => {
      const { getByTestId } = render(<ResultElement {...props} />);
      expect(getByTestId('search-result-element-preview-button')).not.toHaveAttribute('disabled');
    });
  });

  describe('when hasResult is false', () => {
    test('will render a disabled preview button', () => {
      const { getByTestId } = render(<ResultElement {...{ ...props, hasResult: false }} />);
      expect(getByTestId('search-result-element-preview-button')).toHaveAttribute('disabled');
    });
  });
});
