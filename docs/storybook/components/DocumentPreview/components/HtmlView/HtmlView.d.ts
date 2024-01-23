import { HTMLAttributes } from 'react';
import { QueryResult, QueryResultPassage, QueryTableResult } from 'ibm-watson/discovery/v2';
import { QueryResultWithOptionalMetadata } from 'components/DocumentPreview/types';
interface Props extends HTMLAttributes<HTMLElement> {
    /**
     * Document data returned by query
     */
    document: QueryResultWithOptionalMetadata;
    /**
     * table to highlight in document. Reference to item with `document.table_results`
     */
    highlight?: QueryTableResult | QueryResultPassage;
    /**
     * Check to disable toolbar in parent
     */
    setLoading?: (loading: boolean) => void;
    /**
     * Callback which is invoked with whether to enable/disable toolbar controls
     */
    setHideToolbarControls?: (disabled: boolean) => void;
}
export declare const canRenderHtmlView: (document?: QueryResult) => boolean;
export declare const HtmlView: import("react").ForwardRefExoticComponent<Props & import("react").RefAttributes<any>>;
export default HtmlView;
