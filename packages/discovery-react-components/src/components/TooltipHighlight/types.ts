export enum TooltipEvent {
  LEAVE = 1,
  ENTER
}

// TooltipAction is the signature for the callback called my components that will activate the tooltip
export interface TooltipAction {
  tooltipEvent: TooltipEvent;
  rectActiveElement?: DOMRect;
  tooltipContent?: JSX.Element;
}

// Initial state as function so new object generated every time.
export const initAction = (): TooltipAction => ({
  tooltipEvent: TooltipEvent.LEAVE
});

export type OnTooltipShowFn = (tooltipAction: TooltipAction) => void;
