type AsyncFunc<ReturnType> = (signal: AbortSignal) => Promise<ReturnType>;
type AsyncFuncReturnType<T> = T extends AsyncFunc<infer U> ? U : never;
/**
 * Call async function WRAPPED BY `useCallback` and return its result
 *
 * @param asyncFunction async function wrapped by `useCallback`.
 *  Take one parameter `setCancellable` to set _cancellable_ of the current async call.
 * @returns the result of the async function
 */
declare function useAsyncFunctionCall<Func extends AsyncFunc<any>, ReturnType = AsyncFuncReturnType<Func>>(asyncFunction: Func): ReturnType | undefined;
export default useAsyncFunctionCall;
