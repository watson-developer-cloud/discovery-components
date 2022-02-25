import { useContext, useCallback, useState } from 'react';
import { QueryResult } from 'ibm-watson/discovery/v2';
import { SearchContext } from 'components/DiscoverySearch/DiscoverySearch';
import useAsyncFunctionCall from 'utils/useAsyncFunctionCall';
import { DocumentFile } from '../types';

/**
 * When the "file" prop is provided, just return it.
 * Otherwise, fetch the file with the documentProvider.
 * If the fetching time exceeds "fetchTimeout", nothing will be returned.
 */
export function useProvidedFile({
  file,
  document,
  fetchTimeout
}: {
  file?: DocumentFile;
  document?: QueryResult;
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

          const fetchData = async () => {
            const hasFile = await documentProvider.provides(document);
            if (hasFile) {
              const fetchedData = await documentProvider.get(document);
              if (typeof fetchedData === 'string' || fetchedData instanceof ArrayBuffer) {
                return fetchedData;
              } else if (fetchedData?.type === 'pdf') {
                return fetchedData.source;
              }
            }
            return undefined;
          };

          const fetchedData = await Promise.race([
            fetchData(),
            ...(fetchTimeout
              ? [new Promise(resolve => setTimeout(() => resolve(undefined), fetchTimeout))]
              : [])
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
