import { QueryTableResult } from 'ibm-watson/discovery/v2';
import { ProcessedDoc } from 'utils/document';
export declare function getHighlightedTable(highlight: QueryTableResult | null | undefined, processedDoc: ProcessedDoc | null | undefined): import("utils/document").Table | null;
