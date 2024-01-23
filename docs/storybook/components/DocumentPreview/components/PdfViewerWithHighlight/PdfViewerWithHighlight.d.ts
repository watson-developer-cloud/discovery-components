/// <reference types="react" />
import { QueryResultPassage, QueryTableResult } from 'ibm-watson/discovery/v2';
import { FacetInfoMap, OverlapMeta } from '../../types';
import { PdfViewerProps } from '../PdfViewer/PdfViewer';
import { HighlightProps } from '../PdfHighlight/types';
/**
 * PDF viewer component with text highlighting capability
 */
declare const PdfViewerWithHighlight: import("react").ForwardRefExoticComponent<PdfViewerProps & HighlightProps & {
    /**
     * Passage or table highlight from query result.
     * This property overrides `highlights` property if specified
     */
    highlight?: QueryTableResult | QueryResultPassage | undefined;
    facetInfoMap?: FacetInfoMap | undefined;
    overlapMeta?: OverlapMeta | undefined;
    _isPdfRenderError?: boolean | undefined;
    setIsPdfRenderError?: ((state: boolean) => any) | undefined;
} & import("react").RefAttributes<any>>;
/**
 * Hook to handle PDF render error
 */
export declare function useIsPfdError(isPdfRenderError: boolean, callbackIsPdfError?: (state: boolean) => any): import("react").Dispatch<import("react").SetStateAction<boolean>>;
/**
 * Hook to move PDF page depending on active highlight
 */
export declare function useMovePageToActiveHighlight(page: number, activeHighlightPages: number[], activeIds?: string[], setPage?: (page: number) => any): number;
export default PdfViewerWithHighlight;
