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

export interface QuerytResultMetadataWithOptionalCollectionId
  extends Omit<QueryResultMetadata, 'collection_id'>,
    Partial<Pick<QueryResultMetadata, 'collection_id'>> {
  collection_id?: string;
}
export interface QueryResultWithOptionalMetadata extends Omit<QueryResult, 'result_metadata'> {
  result_metadata?: QuerytResultMetadataWithOptionalCollectionId;
}

export type DocumentFile = string | TypedArray | DocumentInitParameters;
