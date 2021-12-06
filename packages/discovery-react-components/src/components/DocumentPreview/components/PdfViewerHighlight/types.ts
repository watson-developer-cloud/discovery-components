import { Bbox as DocPreviewBbox, TextSpan as DocPreviewTextSpan } from '../../types';
import { Location } from 'utils/document/processDoc';

// (re-)export useful types
export type Bbox = DocPreviewBbox;
export type TextSpan = DocPreviewTextSpan;

/**
 * A document. Same to QueryResult, but this more focuses on document fields
 */
export type DocumentFields = { [fieldName: string]: string[] | undefined };

/**
 * Highlight on a document field
 */
export type DocumentFieldHighlight = {
  field: string;
  fieldIndex: number;
  location: Location;
  className?: string;
};

/**
 * Highlight shape on a page, which consists of boundary boxes
 */
export interface HighlightShape {
  boxes: HighlightShapeBox[];
  className?: string;
}

/**
 * Boundary box for a highlight
 */
export interface HighlightShapeBox {
  bbox: Bbox;
  dir?: string; // e.g. ltr, rtl. ltr by default
  isStart?: boolean;
  isEnd?: boolean;
}
