import { useEffect, useCallback, useState, useRef } from 'react';
import { QueryResult } from 'ibm-watson/discovery/v2';
import { DocumentProvider } from 'components/DiscoverySearch/types';

export function useFileFetcher(timeout: number, setFile: (file: string) => void) {
  const [fetching, setFetching] = useState(false);
  const [fetchedFile, setFetchedFile] = useState<string | undefined>();
  const [isTimedOut, setIsTimedOut] = useState(false);
  const timeoutTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchFile = useCallback(
    async (document: QueryResult, documentProvider: DocumentProvider) => {
      setFetching(true);
      const hasFile = await documentProvider.provides(document!);
      if (hasFile) {
        setFetchedFile(await documentProvider.get(document!));
      }
    },
    [timeout]
  );

  useEffect(() => {
    if (fetchedFile && !isTimedOut) {
      setFile(fetchedFile);
      if (timeoutTimer.current) {
        clearTimeout(timeoutTimer.current);
      }
    }
    setFetching(false);
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

  return {
    fetching,
    fetchFile
  };
}
