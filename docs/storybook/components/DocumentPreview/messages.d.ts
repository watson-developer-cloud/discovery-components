export interface Messages {
    noDataMessage?: string;
    errorMessage?: string;
    formatTotalPages?: (total: number) => string;
    previousPageLabel?: string;
    nextPageLabel?: string;
    zoomInLabel?: string;
    zoomOutLabel?: string;
    resetZoomLabel?: string;
}
export declare const defaultMessages: Required<Messages>;
