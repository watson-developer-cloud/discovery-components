import { TextMappings } from 'components/DocumentPreview/types';
import { QueryResult } from 'ibm-watson/discovery/v2';
import { ProcessedDoc } from 'utils/document';
import { Location } from '../../../../types';
import { DocumentFields, TextSpan } from '../../types';
/**
 * Get value of the specified field from a search result document
 *
 * @param document search result document
 * @param field field name
 * @param index field index. 0 by default
 * @param span (optional) span on the field value to return. Returns entire the field value by default
 * @returns text
 */
export declare function getDocFieldValue(document: DocumentFields, field: string, index?: number, span?: Location | TextSpan): string | undefined;
export type ExtractedDocumentInfo = {
    processedDoc: ProcessedDoc;
    textMappings?: TextMappings;
};
/**
 * Extract bboxes and text_mappings from a search result document
 */
export declare function extractDocumentInfo(document: QueryResult, options?: {
    tables?: boolean;
}): Promise<ExtractedDocumentInfo>;
