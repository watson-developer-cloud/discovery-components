/// <reference types="react" />
export declare const props: () => {
    page: number;
    pageSize: number;
    pageSizes: number[];
    showPageSizeSelector: import("@storybook/addon-knobs/dist/type-defs").Mutable<boolean>;
    messages: import("../messages").Messages;
};
declare const _default: {
    title: string;
    parameters: {
        component: import("react").ForwardRefExoticComponent<Omit<import("../ResultsPagination").ResultsPaginationProps, "ref"> & import("react").RefAttributes<any>>;
    };
    excludeStories: string[];
};
export default _default;
export declare const Default: {
    render: () => JSX.Element;
    name: string;
};
