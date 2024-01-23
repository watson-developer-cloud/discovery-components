/**
 * Renders a "CI" (HTML) document using a virtual "infinite" list, for
 * performance reasons.
 */
import { FC } from 'react';
import { OnFieldClickFn } from '../Section/Section';
import { Theme } from 'utils/theme';
import { SectionType, ItemMap, TextHighlightWithMeta } from 'components/CIDocument/types';
import { FacetInfoMap, OverlapMeta } from '../../../DocumentPreview/types';
export interface CIDocumentContentProps {
    className?: string;
    styles?: string[];
    sections: SectionType[];
    itemMap: ItemMap;
    highlightedIds?: string[];
    activeIds?: string[];
    activePartIds?: string[];
    selectableIds?: string[];
    activeMetadataIds?: string[];
    width?: number;
    height?: number;
    theme?: Theme;
    documentId?: string;
    onItemClick?: OnFieldClickFn;
    combinedHighlights?: TextHighlightWithMeta[];
    facetInfoMap?: FacetInfoMap;
    overlapMeta?: OverlapMeta;
    activeColor?: string | null;
}
declare const CIDocumentContent: FC<CIDocumentContentProps>;
export default CIDocumentContent;
