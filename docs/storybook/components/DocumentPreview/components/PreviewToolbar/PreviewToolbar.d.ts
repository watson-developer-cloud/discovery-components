import React, { ComponentType } from 'react';
export declare const ZOOM_IN = "zoom-in";
export declare const ZOOM_OUT = "zoom-out";
export declare const ZOOM_RESET = "reset-zoom";
/**
 * User-defined action on the toolbar
 */
export type ToolbarAction = ToolbarButton | ToolbarItem;
/**
 * User-defined icon button action on the toolbar
 */
type ToolbarButton = {
    id?: string;
    /**
     * Toolbar icon
     */
    renderIcon: React.Component;
    /**
     * Toolbar icon button description
     */
    iconDescription: string;
    /**
     * True to disable toolbar icon button
     */
    disabled?: boolean;
    /**
     * Action handler
     */
    onClick: () => void;
};
/**
 * User defined widget on the toolbar
 */
type ToolbarItem = {
    id?: string;
    /**
     * Render function to render toolbar item
     */
    render: ComponentType;
};
declare const PrevToolbar: any;
export { PrevToolbar as PreviewToolbar };
