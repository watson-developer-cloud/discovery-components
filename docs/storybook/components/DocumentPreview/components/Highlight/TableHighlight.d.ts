import { FC, ReactElement } from 'react';
import { QueryResult, QueryTableResult } from 'ibm-watson/discovery/v2';
interface Props {
    /**
     * Document data returned by query
     */
    document?: QueryResult | null;
    /**
     * Page to display
     */
    currentPage: number;
    /**
     * Highlight descriptor, to be highlighted
     */
    highlight: QueryTableResult;
    /**
     * Callback to set first page of found highlight
     */
    setHighlightFirstPage?: (page: number) => void;
    children: (props: any) => ReactElement;
}
export declare const TableHighlight: FC<Props>;
export default TableHighlight;
