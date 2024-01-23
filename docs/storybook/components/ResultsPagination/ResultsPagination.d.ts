import { ForwardedRef } from 'react';
import { Messages } from './messages';
/**
 * A pagination component to allow users to navigate through multiple pages of results
 *
 * Externalizes a reset function through an imperative API (via the `ref` prop) that resets the component to page 1.
 */
export interface ResultsPaginationProps {
    /**
     * The current page
     */
    page?: number;
    /**
     * Number of items per page
     */
    pageSize?: number;
    /**
     * Choices of `pageSize`
     */
    pageSizes?: Array<number>;
    /**
     * Specify whether to show the selector for dynamically changing `pageSize`
     */
    showPageSizeSelector?: boolean;
    /**
     * override default messages for the component by specifying custom and/or internationalized text strings
     */
    messages?: Partial<Messages>;
    /**
     * custom handler invoked when any input element changes in the ResultsPagination component
     */
    onChange?: (e: ResultsPaginationEvent) => void;
    /**
     * Reference to imperative API
     */
    apiRef?: ForwardedRef<ResultsPaginationAPI>;
    /**
     * Additional props to be passed into Carbon's Pagination component
     */
    [key: string]: any;
}
interface ResultsPaginationEvent {
    page: number;
    pageSize: number;
}
export interface ResultsPaginationAPI {
    reset: (options: ResetOptions) => void;
}
interface ResetOptions {
    triggerOnChange?: boolean;
}
declare const _default: import("react").ForwardRefExoticComponent<Omit<ResultsPaginationProps, "ref"> & import("react").RefAttributes<any>>;
export default _default;
