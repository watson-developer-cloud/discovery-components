import { useState, useLayoutEffect, RefObject } from 'react';
import useResizeObserver from '@react-hook/resize-observer';

type Size = {
  width: number;
  height: number;
};

/**
 * This hook is similar to the useSize hook shipped with @react-hook,
 * but uses getBoundingClientRect for more precise measurements
 *
 * @param target A React ref of the element to be measured
 */
const useSize = <T extends HTMLElement>(target: RefObject<T>): Size => {
  const [size, setSize] = useState<Size>(getCurrentSize(target));

  useLayoutEffect(() => {
    setSize(getCurrentSize(target));
  }, [target]);

  useResizeObserver(target, () => {
    setSize(getCurrentSize(target));
  });

  return size;
};

function getCurrentSize(target: RefObject<HTMLElement>) {
  const size = target?.current?.getBoundingClientRect();
  return {
    width: size?.width || 0,
    height: size?.height || 0
  };
}

export default useSize;
