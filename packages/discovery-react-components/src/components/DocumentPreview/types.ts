import { QueryResult, QueryResultMetadata } from 'ibm-watson/discovery/v2';
import { DocumentInitParameters, TypedArray } from 'pdfjs-dist/types/display/api';

export interface TextMappings {
  pages: Page[];
  text_mappings: Cell[];
}

// [ left, top, right, bottom ]
export type Bbox = [number, number, number, number];

// [ start (inclusive), end (exclusive) ]
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
    text_mappings?: string; // exists when custom SDU model or OOB (CI) model enabled
  };
}

// a version of the QueryResultMetadata type from V2 Discovery, but where collection_id is an optional prop
export interface QuerytResultMetadataWithOptionalCollectionId
  extends Omit<QueryResultMetadata, 'collection_id'>,
    Partial<Pick<QueryResultMetadata, 'collection_id'>> {
  collection_id?: string;
}

// a version of the QueryResult type from V2 Discovery, but where result_metadata is an optional prop
export interface QueryResultWithOptionalMetadata extends Omit<QueryResult, 'result_metadata'> {
  result_metadata?: QuerytResultMetadataWithOptionalCollectionId;
}

// Data on a single Facet.

export interface FacetInfo {
  facetId: string;
  // color applied to visualized enrichments.
  color: string;
  // displayName shown in tooltip over enrichement.
  displayName: string;
}

// Collection of facets
export type FacetInfoMap = Record<string, FacetInfo>;

export type DocumentFile = string | TypedArray | DocumentInitParameters;
