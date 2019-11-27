import { useRef, useEffect, useCallback, useMemo, EffectCallback } from 'react';
import isEqual from 'lodash/isEqual';

// Pulled from https://github.com/kentcdodds/use-deep-compare-effect
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useDeepCompareMemoize(value: any): any {
  const ref = useRef();
  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
}

export function useDeepCompareMemo<T>(
  factory: () => T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dependencies: readonly any[] | undefined
): T {
  return useMemo(factory, useDeepCompareMemoize(dependencies));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDeepCompareCallback<T extends (...args: any[]) => any>(
  callback: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dependencies: readonly any[]
): T {
  return useCallback(callback, useDeepCompareMemoize(dependencies));
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDeepCompareEffect(callback: EffectCallback, dependencies: readonly any[]): void {
  useEffect(callback, useDeepCompareMemoize(dependencies));
}
