import { FC, ReactElement } from 'react';
import { QueryResultPassage, QueryResult } from 'ibm-watson/discovery/v2';
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
    highlight: QueryResultPassage;
    /**
     * Callback to set first page of found highlight
     */
    setHighlightFirstPage?: (page: number) => void;
    children: (props: any) => ReactElement;
}
export declare const PassageHighlight: FC<Props>;
export default PassageHighlight;
