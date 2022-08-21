import DiscoveryV2, { JsonObject, QueryResult } from 'ibm-watson/discovery/v2';
import { DocumentInitParameters } from 'pdfjs-dist/types/display/api';

export type SearchClient = Pick<
  DiscoveryV2,
  'query' | 'getAutocompletion' | 'listCollections' | 'getComponentSettings' | 'listFields'
>;

export type SearchParams = Omit<DiscoveryV2.QueryParams, 'projectId' | 'headers'> & {
  /**
   * @deprecated "returnFields" has been renamed as "_return"
   */
  returnFields?: string[];
};

export interface DocumentProviderProps
  extends Pick<QueryResult, 'document_id' | 'metadata' | 'result_metadata'> {
  extracted_metadata?: JsonObject;
}

/**
 * Document data for PDFSource
 */
type TypedPdfDocumentFile = {
  type: 'pdf';
  source: DocumentInitParameters;
};
export type TypedDocumentFile = TypedPdfDocumentFile;

export interface DocumentProvider {
  /**
   * Return `true` if service can provide the given document
   */
  provides: (document: DocumentProviderProps) => Promise<boolean>;
  /**
   * Return document data for given document, as a "binary" string or an object
   * wrapping PDFSource `{ type: 'pdf', source: PDFSource }`.
   */
  get: (document: DocumentProviderProps) => Promise<string | TypedDocumentFile>;
}
