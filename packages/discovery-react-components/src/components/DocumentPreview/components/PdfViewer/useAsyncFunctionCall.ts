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
): ReturnType | undefined {
  const [result, setResult] = useState<ReturnType | undefined>();

  useEffect(() => {
    let state: 'pending' | 'fulfilled' | 'rejected' = 'pending';
    const abortController = new AbortController();

    asyncFunction(abortController.signal)
      .then((promiseResult: ReturnType) => {
        state = 'fulfilled';
        if (!abortController.signal.aborted && promiseResult !== undefined) {
          setResult(promiseResult);
        }
      })
      .catch(err => {
        state = 'rejected';
        if (!abortController.signal.aborted) {
          throw err;
        }
      });

    return (): void => {
      if (state === 'pending') {
        abortController.abort();
      }
    };
  }, [asyncFunction]);

  return result;
}

export default useAsyncFunctionCall;
