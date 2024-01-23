/// <reference types="react" />
import DiscoveryV2 from 'ibm-watson/discovery/v2';
export declare const props: () => {
    showCollections: import("@storybook/addon-knobs/dist/type-defs").Mutable<boolean>;
    showDynamicFacets: import("@storybook/addon-knobs/dist/type-defs").Mutable<boolean>;
    showMatchingResults: import("@storybook/addon-knobs/dist/type-defs").Mutable<boolean>;
    collapsedFacetsCount: number;
    messages: import("../messages").Messages;
    componentSettingsAggregations: DiscoveryV2.ComponentSettingsResponse;
};
declare const _default: {
    title: string;
    parameters: {
        component: import("react").ComponentType<import("../SearchFacets").SearchFacetsProps>;
    };
    excludeStories: string[];
};
export default _default;
export declare const Default: {
    render: () => JSX.Element;
    name: string;
};
export declare const WithInitialSelectedCollection: {
    render: () => JSX.Element;
    name: string;
};
export declare const WithInitialSelectedFacets: {
    render: () => JSX.Element;
    name: string;
};
