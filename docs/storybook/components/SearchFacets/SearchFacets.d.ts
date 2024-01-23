import React, { SyntheticEvent } from 'react';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { Messages } from './messages';
export interface SearchFacetsProps {
    /**
     * ID for the SearchFacets
     */
    id?: string;
    /**
     * Show list of collections as facets
     */
    showCollections?: boolean;
    /**
     * Show list of dynamic facets
     */
    showDynamicFacets?: boolean;
    /**
     * Show matching documents count as part of label
     */
    showMatchingResults?: boolean;
    /**
     * Override default messages for the component by specifying custom and/or internationalized text strings
     */
    messages?: Partial<Messages>;
    /**
     * Override aggregation component settings
     */
    overrideComponentSettingsAggregations?: DiscoveryV2.ComponentSettingsAggregation[];
    /**
     * Number of facet terms to show when list is collapsed
     */
    collapsedFacetsCount?: number;
    /**
     * Override default message displayed when receiving an error on server request
     */
    serverErrorMessage?: React.ReactNode;
    /**
     * Custom handler invoked when any input element changes in the SearchFacets component.
     * Takes a synthethic event from an HTML Input Element or a string array from custom
     * onChange events that do not use synthethic events.
     */
    onChange?: (e: SyntheticEvent<HTMLInputElement> | string[]) => void;
}
declare const _default: React.ComponentType<SearchFacetsProps>;
export default _default;
