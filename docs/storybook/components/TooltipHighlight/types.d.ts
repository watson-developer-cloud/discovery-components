/// <reference types="react" />
export declare enum TooltipEvent {
    LEAVE = 1,
    ENTER = 2
}
export interface TooltipAction {
    tooltipEvent: TooltipEvent;
    rectActiveElement?: DOMRect;
    tooltipContent?: JSX.Element;
}
export declare const initAction: () => TooltipAction;
export type OnTooltipShowFn = (tooltipAction: TooltipAction) => void;
