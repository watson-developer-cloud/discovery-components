import { ComponentType, HTMLAttributes } from 'react';
import { QueryResult, QueryResultPassage, QueryTableResult } from 'ibm-watson/discovery/v2';
interface Props extends HTMLAttributes<HTMLElement> {
    /**
     * Document data returned by query
     */
    document: QueryResult;
    highlight?: QueryResultPassage | QueryTableResult;
    /**
     * Check to disable toolbar in parent
     */
    setLoading: (loading: boolean) => void;
    /**
     * Callback which is invoked with whether to enable/disable toolbar controls
     */
    setHideToolbarControls?: (disabled: boolean) => void;
    /**
     * React component rendered as a fallback when no preview is available.
     * When specified, the default error component which displays `cannotPreviewMessage`
     * won't be displayed.
     */
    fallbackComponent?: ComponentType<ErrorComponentProps>;
    /**
     * Error title displayed when no preview can be displayed by this component.
     * Unused when `fallbackComponent` is provided
     */
    cannotPreviewMessage?: string;
    /**
     * Error message displayed when no preview can be displayed by this component.
     * Unused when `fallbackComponent` is provided
     */
    cannotPreviewMessage2?: string;
    loading: boolean;
    hideToolbarControls: boolean;
}
interface ErrorComponentProps {
    document: QueryResult;
}
export declare const SimpleDocument: import("react").ForwardRefExoticComponent<Props & import("react").RefAttributes<any>>;
export default SimpleDocument;
