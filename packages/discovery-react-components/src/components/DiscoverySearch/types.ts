import DiscoveryV2, { JsonObject, QueryResult } from 'ibm-watson/discovery/v2';

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

export interface DocumentProviderProps extends Pick<QueryResult, 'document_id' | 'metadata'> {
  extracted_metadata?: JsonObject;
}

export interface DocumentProvider {
  /**
   * Return `true` if service can provide the given document
   */
  provides: (document: DocumentProviderProps) => boolean;
  /**
   * Return document data for given document, as a base64-encoded string
   */
  get: (document: DocumentProviderProps) => {};
}
