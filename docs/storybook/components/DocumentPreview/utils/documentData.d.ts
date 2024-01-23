import { QueryResult, QueryResultPassage, QueryTableResult } from 'ibm-watson/discovery/v2';
import { DiscoveryDocument, DocumentFile, PreviewType, QueryResultWithOptionalMetadata, TextMappings } from '../types';
/**
 * Get `text_mappings` document property as an object. Usually, this
 * prop is stored as a JSON string; if so, parse and return as object.
 */
export declare function getTextMappings(doc: QueryResultWithOptionalMetadata | null | undefined): TextMappings | null | undefined;
/**
 * Returns true if the `file_type` is CSV
 */
export declare function isCsvFile(doc: QueryResult | null | undefined): boolean;
/**
 * Returns true if the `file_type` is JSON
 */
export declare function isJsonFile(doc: QueryResult | null | undefined): boolean;
/**
 * Returns the preview type for document
 */
export declare function detectPreviewType(document: DiscoveryDocument, file?: DocumentFile, highlight?: QueryResultPassage | QueryTableResult, isPdfRenderError?: boolean | false): PreviewType;
