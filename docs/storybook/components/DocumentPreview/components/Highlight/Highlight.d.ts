import { FC } from 'react';
import { QueryResultPassage, QueryResult, QueryTableResult } from 'ibm-watson/discovery/v2';
import { Bbox, Origin } from 'components/DocumentPreview/types';
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
    highlight?: QueryResultPassage | QueryTableResult;
    /**
     * Classname for highlight <rect>
     */
    highlightClassname?: string;
    /**
     * Callback to set first page of found highlight
     */
    setHighlightFirstPage?: (page: number) => void;
}
export interface ChildrenProps {
    bboxes: Bbox[];
    origin: Origin;
    pageWidth: number;
    pageHeight: number;
}
export declare const Highlight: FC<Props>;
export default Highlight;
