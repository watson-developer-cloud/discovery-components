import React, { FC, useState, useEffect } from 'react';
import { render } from '@testing-library/react';
import {
  useDeepCompareMemo,
  useDeepCompareEffect,
  useDeepCompareCallback
} from '../useDeepCompareMemoize';

interface MyComponentProps {
  value: string;
}

const MyMemoComponent: FC<MyComponentProps> = props => {
  const [count, setCount] = useState(0);

  useDeepCompareMemo(() => {
    setCount(count => count + 1);
    return {};
  }, [props]);

  return <div data-testid="counter">{count}</div>;
};

const MyEffectComponent: FC<MyComponentProps> = props => {
  const [count, setCount] = useState(0);

  useDeepCompareEffect(() => {
    setCount(count => count + 1);
  }, [props]);

  return <div data-testid="counter">{count}</div>;
};

const MyCallbackComponent: FC<MyComponentProps> = props => {
  const [count, setCount] = useState(0);

  const callback = useDeepCompareCallback(() => {}, [props]);

  useEffect(() => {
    setCount(count => count + 1);
  }, [callback]);

  return <div data-testid="counter">{count}</div>;
};

describe('useDeepCompareMemoize functions', () => {
  describe('useDeepCompareMemo', () => {
    it('does not re-execute when the object has the same values', () => {
      const { rerender, getByTestId } = render(<MyMemoComponent value={'foo'} />);
      expect(getByTestId('counter').textContent).toEqual('1');
      rerender(<MyMemoComponent value={'foo'} />);
      expect(getByTestId('counter').textContent).toEqual('1');
    });

    it('does re-execute when the object has different values', () => {
      const { rerender, getByTestId } = render(<MyMemoComponent value={'foo'} />);
      expect(getByTestId('counter').textContent).toEqual('1');
      rerender(<MyMemoComponent value={'bar'} />);
      expect(getByTestId('counter').textContent).toEqual('2');
    });
  });

  describe('useDeepCompareEffect', () => {
    it('does not re-execute when the object has the same values', () => {
      const { rerender, getByTestId } = render(<MyEffectComponent value={'foo'} />);
      expect(getByTestId('counter').textContent).toEqual('1');
      rerender(<MyEffectComponent value={'foo'} />);
      expect(getByTestId('counter').textContent).toEqual('1');
    });

    it('does re-execute when the object has different values', () => {
      const { rerender, getByTestId } = render(<MyEffectComponent value={'foo'} />);
      expect(getByTestId('counter').textContent).toEqual('1');
      rerender(<MyEffectComponent value={'bar'} />);
      expect(getByTestId('counter').textContent).toEqual('2');
    });
  });

  describe('useDeepCompareCallback', () => {
    it('does not re-execute when the object has the same values', () => {
      const { rerender, getByTestId } = render(<MyCallbackComponent value={'foo'} />);
      expect(getByTestId('counter').textContent).toEqual('1');
      rerender(<MyCallbackComponent value={'foo'} />);
      expect(getByTestId('counter').textContent).toEqual('1');
    });

    it('does re-execute when the object has different values', () => {
      const { rerender, getByTestId } = render(<MyCallbackComponent value={'foo'} />);
      expect(getByTestId('counter').textContent).toEqual('1');
      rerender(<MyCallbackComponent value={'bar'} />);
      expect(getByTestId('counter').textContent).toEqual('2');
    });
  });
});
