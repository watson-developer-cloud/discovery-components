import { QueryResult } from 'ibm-watson/discovery/v2';
import { DocumentFile } from '../types';
/**
 * When the "file" prop is provided, just return it.
 * Otherwise, fetch the file with the documentProvider.
 * If the fetching time exceeds "fetchTimeout", nothing will be returned.
 */
export declare function useFetchDocumentFile({ file, document, fetchTimeout }: {
    file?: DocumentFile;
    document?: QueryResult;
    fetchTimeout?: number;
}): {
    providedFile: DocumentFile | undefined;
    isFetching: boolean;
};
