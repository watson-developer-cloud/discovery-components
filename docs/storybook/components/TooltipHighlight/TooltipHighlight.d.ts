import React, { FC } from 'react';
import { TooltipAction } from './types';
import { FacetInfoMap, OverlapMeta } from 'components/DocumentPreview/types';
type Props = {
    parentDiv: React.MutableRefObject<HTMLDivElement | null>;
    tooltipAction: TooltipAction;
};
export declare const TooltipHighlight: FC<Props>;
export declare function calcToolTipContent(facetInfoMap: FacetInfoMap, overlapMeta: OverlapMeta, facetId: string, enrichValue: string, enrichFieldId: string): JSX.Element | undefined;
export {};
