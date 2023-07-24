import { Bbox as DocPreviewBbox, TextSpan as DocPreviewTextSpan } from '../../types';
import { Location } from 'utils/document/processDoc';
import { QueryResult } from 'ibm-watson/discovery/v2';

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
  id?: string;
  field: string;
  fieldIndex: number;
  location: Location;
  className?: string;
  facetId?: string;
  value?: string;
};

/**
 * Highlight based on bbox
 */
export type DocumentBboxHighlight = {
  id?: string;
  bboxes: {
    page: number;
    bbox: Bbox;
  }[];
  className?: string;
};

/**
 * Highlight shape on a page, which consists of boundary boxes
 */
export interface HighlightShape {
  highlightId: string;
  boxes: HighlightShapeBox[];
  className?: string;
  facetId?: string;
  value?: string;
}

/**
 * Boundary box for a highlight
 */
export interface HighlightShapeBox {
  bbox: Bbox;
  dir?: string; // e.g. ltr, rtl. ltr by default
  isStart?: boolean;
  isEnd?: boolean;
  facetId?: string;
}

export interface HighlightProps {
  /**
   * Class name to style each highlight
   */
  highlightClassName?: string;

  /**
   * Class name to style each active highlight
   */
  activeHighlightClassName?: string;

  /**
   * Document data returned by query
   */
  document?: QueryResult;

  /**
   * Highlight spans on fields in document
   */
  highlights?: DocumentFieldHighlight[];

  /**
   * Active highlight IDs
   */
  activeIds?: string[];

  /**
   * callback to be notified page change by scrollIntoActiveId
   */
  setCurrentPage?: (page: number) => any;

  /**
   * Consider bboxes in HTML field to highlight.
   * True by default. This is for testing purpose.
   */
  _useHtmlBbox?: boolean;

  /**
   * Flag to whether to use PDF text items for finding bbox for highlighting.
   * True by default. This is for testing and debugging purpose.
   */
  _usePdfTextItem?: boolean;
}
