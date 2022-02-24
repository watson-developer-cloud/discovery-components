import { useContext, useCallback, useState } from 'react';
import { QueryResult } from 'ibm-watson/discovery/v2';
import { SearchContext } from 'components/DiscoverySearch/DiscoverySearch';
import useAsyncFunctionCall from 'utils/useAsyncFunctionCall';
import { DocumentFile } from '../types';

export function useProvidedFile({
  document,
  file,
  fetchTimeout
}: {
  document?: QueryResult;
  file?: DocumentFile;
  fetchTimeout?: number;
}) {
  const { documentProvider } = useContext(SearchContext);
  const [fetchedFile, setFetchedFile] = useState<DocumentFile>();
  const [fetching, setFetching] = useState(false);

  useAsyncFunctionCall(
    useCallback(
      async (signal: AbortSignal) => {
        if (!file && document && documentProvider) {
          setFetching(true);
          setFetchedFile(undefined);

          const fetchedData = await Promise.race([
            new Promise(async resolve => {
              const hasFile = await documentProvider.provides(document!);
              if (hasFile) {
                const fetchedData = await (documentProvider.get(document!) as DocumentFile);
                return resolve(fetchedData);
              }
              return resolve(undefined);
            }),
            new Promise(resolve => {
              if (fetchTimeout) {
                setTimeout(() => resolve(null), fetchTimeout);
              }
            })
          ]);

          if (!signal.aborted) {
            setFetching(false);
            setFetchedFile(fetchedData as DocumentFile);
          }
        }
      },
      [file, fetchTimeout, document, documentProvider]
    )
  );

  return {
    providedFile: file || fetchedFile,
    fetching
  };
}
