/**
 * A section of a CI (HTML) document. Rendered as a row within a virtual
 * "infinite" list.
 */
import { FC } from 'react';
import { SectionType, Field } from 'components/CIDocument/types';
import { FacetInfoMap, OverlapMeta } from '../../../DocumentPreview/types';
export type OnFieldClickFn = (field: Field) => void;
interface SectionProps {
    section: SectionType;
    onFieldClick?: OnFieldClickFn;
    facetInfoMap?: FacetInfoMap;
    overlapMeta?: OverlapMeta;
}
export declare const Section: FC<SectionProps>;
export default Section;
