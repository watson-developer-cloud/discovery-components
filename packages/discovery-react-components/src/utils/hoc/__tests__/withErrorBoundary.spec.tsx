import React, { FC, useEffect } from 'react';
import { render, BoundFunction, GetByText } from '@testing-library/react';
import { withErrorBoundary, WithErrorBoundaryProps } from '../withErrorBoundary';

interface TestComponentProps extends WithErrorBoundaryProps {
  doError?: boolean;
}

const TestComponent: FC<TestComponentProps> = ({ doError = false, didCatch }) => {
  useEffect(() => {
    if (!didCatch && doError) {
      throw new Error('ERROR');
    }
  }, [didCatch, doError]);

  if (didCatch) {
    return <div>Failed to load due to error</div>;
  }
  return <div>Here is some text</div>;
};

const WrappedTestComponent = withErrorBoundary(TestComponent);

describe('withErrorBoundary', () => {
  it('renders a component normally', () => {
    render(<WrappedTestComponent />);
  });

  it('test component crashes', () => {
    expect(() => {
      render(<TestComponent doError={true} didCatch={false} />);
    }).toThrow();
  });

  it('renders error state (and does not crash)', () => {
    // Even though we're handling the error, jsdom will spit out an ugly
    // "Error: Uncaught" block. This prevents it.
    // @see https://github.com/facebook/react/issues/11098#issuecomment-412682721
    function onError(event: Event): void {
      event.preventDefault();
    }
    window.addEventListener('error', onError);

    let getByText: BoundFunction<GetByText>;

    try {
      ({ getByText } = render(<WrappedTestComponent doError={true} />));

      getByText('Failed to load due to error');
    } finally {
      window.removeEventListener('error', onError);
    }
  });
});
