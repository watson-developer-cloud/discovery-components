import { useEffect, useState } from 'react';

type AsyncFunc<ReturnType> = (signal: AbortSignal) => Promise<ReturnType>;
type AsyncFuncReturnType<T> = T extends AsyncFunc<infer U> ? U : never;

/**
 * Call async function WRAPPED BY `useCallback` and return its result
 *
 * @param asyncFunction async function wrapped by `useCallback`.
 *  Take one parameter `setCancellable` to set _cancellable_ of the current async call.
 * @returns the result of the async function
 */
function useAsyncFunctionCall<Func extends AsyncFunc<any>, ReturnType = AsyncFuncReturnType<Func>>(
  asyncFunction: Func
): [ReturnType | undefined, Error | undefined, boolean] {
  const [result, setResult] = useState<ReturnType | undefined>();
  const [error, setError] = useState<Error | undefined>();
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    let resolved = false;
    const abortController = new AbortController();
    setResolved(false);

    asyncFunction(abortController.signal)
      .then((promiseResult: ReturnType) => {
        if (!abortController.signal.aborted && promiseResult !== undefined) {
          setResult(promiseResult);
        }
      })
      .catch(err => {
        if (!abortController.signal.aborted) {
          setError(err);
        }
      })
      .finally(() => {
        resolved = true;
        setResolved(true);
      });

    return (): void => {
      if (!resolved) {
        abortController.abort();
      }
    };
  }, [asyncFunction]);

  return [result, error, resolved];
}

export default useAsyncFunctionCall;
