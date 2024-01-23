import { QueryResult, QueryResultPassage } from 'ibm-watson/discovery/v2';
import { Table } from 'utils/document';
import { DocumentBboxHighlight, HighlightShape } from '../../types';
import { DocumentFieldHighlight } from 'components/DocumentPreview/types';
export declare const DEFAULT_HIGHLIGHT_ID = "highlight";
export declare function convertToDocumentFieldHighlights(passage: QueryResultPassage, document?: QueryResult): DocumentFieldHighlight[] | null;
export declare function convertToDocumentBboxHighlights(table: Table, { id, className }?: {
    id?: string;
    className?: string;
}): DocumentBboxHighlight[];
export declare function getShapeFromBboxHighlight(highlights: DocumentBboxHighlight[], page: number): HighlightShape[];
