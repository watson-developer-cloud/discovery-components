import React, { FC, useState, useEffect } from 'react';
import cx from 'classnames';
import { Tooltip } from 'carbon-components-react';
import { settings } from 'carbon-components';
import { TooltipAction, TooltipEvent } from './types';
import { FacetInfoMap } from 'components/DocumentPreview/types';

// TooltipInfo is the internal state of the TooltipHightlight
interface TooltipInfo {
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

const baseTooltipHighlight = `${settings.prefix}--tooltip-hightlight`;

export const TooltipHighlight: FC<Props> = ({ parentDiv, tooltipAction }) => {
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

export function calcToolTipContent(
  facetInfoMap: FacetInfoMap,
  facetId: string,
  enrichValue: string
) {
  let enrichColor = '';
  let enrichFacetDisplayname = '';
  if (facetInfoMap[facetId]) {
    enrichColor = facetInfoMap[facetId].color;
    enrichFacetDisplayname = facetInfoMap[facetId].displayName;
  }
  const tooltipContent = (
    <div
      style={{
        whiteSpace: 'nowrap'
      }}
    >
      <div
        className={cx(baseTooltipHighlight)}
        style={{
          backgroundColor: enrichColor,
          display: 'inline-block'
        }}
      />
      {enrichFacetDisplayname}, "{enrichValue}"
    </div>
  );
  return tooltipContent;
}
