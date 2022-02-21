import DiscoveryV2, { JsonObject, QueryResult } from 'ibm-watson/discovery/v2';
import { PDFSource } from 'pdfjs-dist';

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
export type PDFSourceDocument = {
  __type: 'pdf';
  source: PDFSource;
};

export interface DocumentProvider {
  /**
   * Return `true` if service can provide the given document
   */
  provides: (document: DocumentProviderProps) => Promise<boolean>;
  /**
   * Return document data for given document, as a "binary" string (array buffer)
   */
  get: (document: DocumentProviderProps) => Promise<string | PDFSourceDocument>;
}
