import { QueryResult, QueryResultPassage } from 'ibm-watson/discovery/v2';
import { CellPage, TextMappings } from 'components/DocumentPreview/types';
export declare function usePassage(document?: QueryResult | null, passage?: QueryResultPassage): ReadonlyArray<CellPage> | null;
export declare function getPassagePageInfo(textMappings: TextMappings, passage: QueryResultPassage): ReadonlyArray<CellPage> | null;
