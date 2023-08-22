import React, { FC, useState, useEffect } from 'react';
import cx from 'classnames';
import { Tooltip } from 'carbon-components-react';
import { settings } from 'carbon-components';
import { TooltipAction, TooltipEvent } from './types';
import { FacetInfoMap } from 'components/DocumentPreview/types';
import { defaultMessages } from 'components/TooltipHighlight/messages';

// TooltipInfo is the internal state of the TooltipHightlight
interface TooltipInfo {
  rectTooltipArea: DOMRect;
  tooltipContent: JSX.Element;
  isOpen: boolean;
}

type Props = {
  //Parent div element
  parentDiv: React.MutableRefObject<HTMLDivElement | null>;

  // State of the highlight-tootip
  tooltipAction: TooltipAction;
};

const baseTooltipPlaceContent = `${settings.prefix}--tooltip-place-content`;
const baseTooltipCustomContent = `${settings.prefix}--tooltip-custom-content`;
const baseTooltipContentHeader = `${settings.prefix}--tooltip-content-header`;
const baseTooltipBoxColor = `${settings.prefix}--tooltip-box-color`;
const baseTooltipContentCell = `${settings.prefix}--tooltip-content-cell`;
const baseTooltipContentCellBuffer = `${settings.prefix}--tooltip-content-cell-buffer`;

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
      isOpen: !!tooltipAction.tooltipContent && isOpen
    };
    setTooltipInfo(tooltipUpdate);
  }, [tooltipAction, setTooltipInfo, parentDiv]);

  return (
    // Outter div is required to provide tooltip element with position information
    // "pointerEvents" = "none" so that underlying elements can react to mouse events
    <div
      className={cx(baseTooltipPlaceContent)}
      style={{
        top: tooltipInfo.rectTooltipArea.y,
        left: tooltipInfo.rectTooltipArea.x
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
              // Provide size so that tooltip knows boundry where to draw the tooltip
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
  const tableContent = [];
  let enrichColor = '';
  let enrichFacetDisplayname = '';
  if (facetInfoMap[facetId]) {
    enrichColor = facetInfoMap[facetId].color;
    enrichFacetDisplayname = facetInfoMap[facetId].displayName;
    // Will have multiple entries after overlapping is implemented
    tableContent.push({
      enrichColor: enrichColor,
      enrichFacetDisplayname: ellipsisMiddle(enrichFacetDisplayname),
      enrichValue: ellipsisMiddle(enrichValue)
    });
  }

  let tooltipContent = undefined;

  if (enrichFacetDisplayname || enrichValue) {
    tooltipContent = (
      <div className={cx(baseTooltipCustomContent)}>
        <div className={cx(baseTooltipContentHeader)}>
          {defaultMessages.enrichmentsHeaderLabel} ({tableContent.length})
        </div>
        <table>
          {tableContent.map((oneRow, index) => {
            let rowBorderClass = {};
            if (index < tableContent.length - 1) {
              rowBorderClass = {
                borderBottom: `1px solid #7A7979`
              };
            }
            return (
              <tr>
                <td className={cx(baseTooltipContentCell)} style={rowBorderClass}>
                  <div
                    className={cx(baseTooltipBoxColor)}
                    style={{
                      backgroundColor: oneRow.enrichColor
                    }}
                  />
                </td>
                <td className={cx(baseTooltipContentCell)} style={rowBorderClass}>
                  <span className={cx(baseTooltipContentCellBuffer)}>
                    {oneRow.enrichFacetDisplayname}
                  </span>
                </td>
                <td className={cx(baseTooltipContentCell)} style={rowBorderClass}>
                  {oneRow.enrichValue &&
                    oneRow.enrichValue.localeCompare(oneRow.enrichFacetDisplayname) !== 0 &&
                    `${oneRow.enrichValue}`}
                </td>
              </tr>
            );
          })}
        </table>
      </div>
    );
  }
  return tooltipContent;
}

function ellipsisMiddle(text: string) {
  const MAX_CONTENT_LENGTH = 30; // even number
  const ELLIPSIS = '...';
  let ellipsisText = text;
  // account for the new string being extended by the ellipsis
  if (text.length > MAX_CONTENT_LENGTH + ELLIPSIS.length) {
    const half = MAX_CONTENT_LENGTH / 2;
    const latterStart = text.length - half;
    ellipsisText = text.substring(0, half) + ELLIPSIS + text.substring(latterStart);
  }
  return ellipsisText;
}
