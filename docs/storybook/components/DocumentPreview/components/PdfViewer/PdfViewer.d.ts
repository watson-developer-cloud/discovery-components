import { HTMLAttributes } from 'react';
import { QueryResult } from 'ibm-watson/discovery/v2';
import { DocumentFile } from '../../types';
import { PdfRenderedText } from './PdfViewerTextLayer';
import { PdfDisplayProps } from './types';
export interface PdfViewerProps extends PdfDisplayProps, HTMLAttributes<HTMLElement> {
    className?: string;
    /**
     * PDF file data as a "binary" string (array buffer) or PDFSource
     */
    file: DocumentFile;
    /**
     * Optionally takes a query result document for page count calculation
     */
    document?: QueryResult | null;
    /**
     * Text layer class name
     */
    textLayerClassName?: string;
    /**
     * Disable the text layer overlay (defaults to `false`)
     */
    disableTextLayer?: boolean;
    /**
     * Callback invoked with page count, once `file` has been parsed
     */
    setPageCount?: (count: number) => void;
    /**
     * Check if document is loading
     */
    setLoading: (loading: boolean) => void;
    /**
     * Callback which is invoked with whether to enable/disable toolbar controls
     */
    setHideToolbarControls?: (disabled: boolean) => void;
    /**
     * Callback for text layer info
     */
    setRenderedText?: (info: PdfRenderedText | null) => any;
    /**
     * Callback any errors on render
     */
    setIsPdfRenderError?: (isError: boolean) => void;
    /**
     * URL of hosted PDF worker
     */
    pdfWorkerUrl?: string;
}
declare const PdfViewer: import("react").ForwardRefExoticComponent<PdfViewerProps & import("react").RefAttributes<any>>;
export default PdfViewer;
