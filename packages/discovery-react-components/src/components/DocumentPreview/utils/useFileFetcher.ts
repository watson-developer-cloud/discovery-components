import { useContext, useEffect, useCallback, useState, useRef } from 'react';
import { QueryResult } from 'ibm-watson/discovery/v2';
import { SearchContext } from 'components/DiscoverySearch/DiscoverySearch';
import useAsyncFunctionCall from 'utils/useAsyncFunctionCall';

export function useFileFetcher({
  document,
  file,
  timeout,
  setFile
}: {
  document?: QueryResult;
  file?: string;
  timeout: number;
  setFile: (file?: string) => void;
}) {
  const { documentProvider } = useContext(SearchContext);
  const [fetching, setFetching] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const timeoutTimer = useRef<NodeJS.Timeout | null>(null);

  const [fetchedFile, _, isFetched] = useAsyncFunctionCall(
    useCallback(async () => {
      // `file` takes precedence over a file provided by `documentProvider`
      if (file) {
        return file;
      } else if (document && documentProvider) {
        const hasFile = await documentProvider.provides(document!);
        if (hasFile) {
          return await documentProvider.get(document!);
        }
      }
      return undefined;
    }, [file, document, documentProvider])
  );

  useEffect(() => {
    setFetching(!isFetched);
  }, [isFetched]);

  useEffect(() => {
    if (fetchedFile && !isTimedOut) {
      setFile(fetchedFile);
      if (timeoutTimer.current) {
        clearTimeout(timeoutTimer.current);
      }
    }
  }, [fetchedFile]);

  useEffect(() => {
    if (timeout) {
      timeoutTimer.current = setTimeout(() => {
        setIsTimedOut(true);
        setFetching(false);
      }, timeout);
    }
    return () => {
      if (timeoutTimer.current) {
        clearTimeout(timeoutTimer.current);
      }
    };
  }, [timeout]);

  return fetching;
}
