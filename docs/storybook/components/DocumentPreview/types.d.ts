import { QueryResult, QueryResultMetadata } from 'ibm-watson/discovery/v2';
import { DocumentInitParameters, TypedArray } from 'pdfjs-dist/types/src/display/api';
export interface TextMappings {
    pages: Page[];
    text_mappings: Cell[];
}
export type Bbox = [number, number, number, number];
export type TextSpan = [number, number];
export type Origin = 'TopLeft' | 'BottomLeft';
export interface Page {
    page_number: number;
    width: number;
    height: number;
    origin: Origin;
}
export interface PageWithCells extends Page {
    cells: StyledCell[];
}
export interface Cell {
    page: CellPage;
    field: CellField;
}
export interface CellPage {
    page_number: number;
    bbox: Bbox;
}
export interface CellField {
    name: string;
    index: number;
    span: TextSpan;
}
export interface StyledCell extends CellPage {
    id: string;
    className?: string;
    content: string;
}
export type PreviewType = 'PDF' | 'HTML' | 'TEXT';
export interface DiscoveryDocument extends QueryResult {
    extracted_metadata?: {
        file_type?: 'pdf' | 'html' | 'json' | 'csv' | 'text' | string;
        text_mappings?: string;
    };
}
export interface QuerytResultMetadataWithOptionalCollectionId extends Omit<QueryResultMetadata, 'collection_id'>, Partial<Pick<QueryResultMetadata, 'collection_id'>> {
    collection_id?: string;
}
export interface QueryResultWithOptionalMetadata extends Omit<QueryResult, 'result_metadata'> {
    result_metadata?: QuerytResultMetadataWithOptionalCollectionId;
}
export interface Location {
    begin: number;
    end: number;
}
/**
 * Highlight on a document field
 */
export type DocumentFieldHighlight = {
    id?: string;
    field: string;
    fieldIndex: number;
    location: Location;
    className?: string;
    facetId?: string;
    value?: string;
};
export interface FacetInfo {
    facetId: string;
    color: string;
    displayName: string;
}
export type FacetInfoMap = Record<string, FacetInfo>;
export interface OverlapInfo {
    overlapId: string;
    mentions: DocumentFieldHighlight[];
}
export type OverlapInfoMap = Record<string, OverlapInfo>;
export interface OverlapMeta {
    overlapInfoMap: OverlapInfoMap;
    fieldIdWithOverlap: Set<string>;
}
export declare const OVERLAP_ID: string;
export declare function initOverlapMeta(): OverlapMeta;
export type DocumentFile = string | TypedArray | DocumentInitParameters;
