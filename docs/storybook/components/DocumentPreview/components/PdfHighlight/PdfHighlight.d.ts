import { FC } from 'react';
import { FacetInfoMap, OverlapMeta } from '../../types';
import { PdfDisplayProps } from '../PdfViewer/types';
import { PdfRenderedText } from '../PdfViewer/PdfViewerTextLayer';
import { ExtractedDocumentInfo } from './utils/common/documentUtils';
import { DocumentBboxHighlight, HighlightProps } from './types';
type Props = PdfDisplayProps & HighlightProps & {
    /**
     * Class name to style highlight layer
     */
    className?: string;
    /**
     * Parsed document information
     */
    parsedDocument: ExtractedDocumentInfo | null;
    /**
     * PDF text content information in a page from parsed PDF
     */
    pdfRenderedText: PdfRenderedText | null;
    /**
     * Highlight bboxes. This overrides `highlights` props
     */
    boxHighlights?: DocumentBboxHighlight[];
    /**
     * Meta-data on facets
     */
    facetInfoMap?: FacetInfoMap;
    /**
     * Overlap information used by tooltip
     */
    overlapMeta?: OverlapMeta;
};
/**
 * Text highlight layer for PdfViewer
 */
declare const PdfHighlight: FC<Props>;
export default PdfHighlight;
