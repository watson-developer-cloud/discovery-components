import React, { FC, useState, useEffect } from 'react';

import { Tooltip } from 'carbon-components-react';

import { TooltipAction, TooltipEvent } from './types';

// TooltipInfo is the internal state of the TooltipHightlight
export interface TooltipInfo {
  rectTooltipArea: DOMRect;
  tooltipContent: JSX.Element;
  isOpen: boolean;
}

type Props = {
  /**
   * Parent div element
   */
  parentDiv: React.MutableRefObject<HTMLDivElement | null>;

  /**
   * state of the highlight-tootip
   */
  tooltipAction: TooltipAction;
};

const TooltipHighlight: FC<Props> = ({ parentDiv, tooltipAction }) => {
  const [tooltipInfo, setTooltipInfo] = useState<TooltipInfo>({
    rectTooltipArea: new DOMRect(),
    tooltipContent: <div></div>,
    isOpen: false
  });

  useEffect(() => {
    // Compute parameters to overlay the tooltip over the active item
    const highlightDivRect = parentDiv.current?.getBoundingClientRect() || new DOMRect();
    const isOpen = tooltipAction.tooltipEvent !== TooltipEvent.LEAVE;
    const clickRect = tooltipAction.rectActiveElement || new DOMRect();
    const tooltipRect = new DOMRect(
      clickRect.x - highlightDivRect.x,
      clickRect.y - highlightDivRect.y,
      clickRect?.width,
      clickRect?.height
    );
    const tooltipUpdate = {
      rectTooltipArea: tooltipRect,
      tooltipContent: tooltipAction.tooltipContent || <div></div>,
      isOpen: isOpen
    };
    setTooltipInfo(tooltipUpdate);
  }, [tooltipAction, setTooltipInfo]);

  return (
    // Outter div is required to provide tooltip element with position information
    <div
      style={{
        border: '2px solid purple',
        width: '50px',
        height: '50px',
        position: 'absolute',
        zIndex: 50,
        top: tooltipInfo.rectTooltipArea.y,
        left: tooltipInfo.rectTooltipArea.x,
        pointerEvents: 'none'
      }}
    >
      <Tooltip
        autoOrientation={true}
        tabIndex={0}
        showIcon={false}
        open={tooltipInfo.isOpen}
        triggerText={
          <div
            style={{
              border: '2px solid orange',
              width: tooltipInfo.rectTooltipArea.width,
              height: tooltipInfo.rectTooltipArea.height,
              pointerEvents: 'none'
            }}
          />
        }
        children={<div>{tooltipInfo.tooltipContent}</div>}
      />
    </div>
  );
};

export default TooltipHighlight;
