import React, { SFC, useRef, useEffect, ReactElement } from 'react';
import { Button, FormLabel, Form, TextInput } from 'carbon-components-react';
import { settings } from 'carbon-components';

import { ZoomIn24 } from '@carbon/icons-react';
import { ZoomOut24 } from '@carbon/icons-react';
import { CaretLeft24 } from '@carbon/icons-react';
import { CaretRight24 } from '@carbon/icons-react';
import { Reset24 } from '@carbon/icons-react';

import { defaultMessages, Messages } from '../../messages';

export const ZOOM_IN = 'zoom-in';
export const ZOOM_OUT = 'zoom-out';
export const ZOOM_RESET = 'reset-zoom';

export type ToolbarAction = {
  id?: string;
  icon: React.Component;
  description: string;
  onClick: () => void;
  disabled: boolean;
};

interface Props {
  /**
   * Show loading state
   */
  loading?: boolean;

  /**
   * Hide toolbar controls
   */
  hideControls?: boolean;

  /**
   * Show pager (true by default)
   */
  showPager?: boolean;

  /**
   * Show zoom (true by default)
   */
  showZoom?: boolean;

  /**
   * User actions displayed on the end of the toolbar
   */
  actions?: ToolbarAction[];

  /**
   * Current page number, starting at 1
   */
  current: number;
  /**
   * Total number of pages
   */
  total: number;
  /**
   * Callback for Zoom functionality
   */
  onZoom: (zoom: string) => void;
  /**
   * Callback for changing the current page
   */
  onChange: (newPage: number) => void;
  /**
   * Messages
   */
  messages?: Messages;
}

const base = `${settings.prefix}--preview-toolbar`;

const PreviewToolbar: SFC<Props> = ({
  loading = false,
  hideControls = false,
  showPager = true,
  showZoom = true,
  actions = [],
  current,
  total,
  onZoom,
  onChange,
  messages
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current != null) {
      inputRef.current.value = current.toString();
    }
  }, [current]);

  const msgs = { ...defaultMessages, messages };
  return (
    <div className={`${base}`}>
      {!hideControls ? (
        <>
          <div className={`${base}__left`}>
            {showPager && (
              <div className={`${base}__nav`}>
                {renderButton({
                  icon: CaretLeft24,
                  description: msgs.previousPageLabel,
                  onClick: () => nextPrevButtonClicked(current, total, onChange, -1),
                  disabled: loading || current === 1
                })}
                <Form
                  onSubmit={(e: Event): void => currentPageChanged(e, onChange, inputRef)}
                  autoComplete="off"
                >
                  <TextInput
                    id="pageInput"
                    defaultValue={current}
                    type="number"
                    ref={inputRef}
                    min={1}
                    max={total}
                    className={`${base}__input`}
                    onBlur={(e: Event): void => currentPageChanged(e, onChange, inputRef)}
                    labelText="labelText"
                    hideLabel={true}
                    disabled={loading}
                  />
                </Form>
                <FormLabel className={`${base}__pageLabel`}>/ {total}</FormLabel>
                {renderButton({
                  icon: CaretRight24,
                  description: msgs.nextPageLabel,
                  onClick: () => nextPrevButtonClicked(current, total, onChange, 1),
                  disabled: loading || current === total
                })}
              </div>
            )}
          </div>
          <div className={`${base}__center ${base}__nav`}></div>
          <div className={`${base}__right`}>
            {showZoom && (
              <>
                {renderButton({
                  icon: ZoomIn24,
                  description: msgs.zoomInLabel,
                  onClick: () => onZoom(ZOOM_IN),
                  disabled: loading
                })}
                {renderButton({
                  icon: ZoomOut24,
                  description: msgs.zoomOutLabel,
                  onClick: () => onZoom(ZOOM_OUT),
                  disabled: loading
                })}
                {renderButton({
                  icon: Reset24,
                  description: msgs.resetZoomLabel,
                  onClick: () => onZoom(ZOOM_RESET),
                  disabled: loading
                })}
              </>
            )}
            {actions.map((action, index) =>
              renderButton({
                ...action,
                key: `toolbar-action-${action.id || index}`
              })
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

function renderButton(obj: {
  key?: string;
  icon: React.Component;
  description: string;
  onClick: () => void;
  disabled: boolean;
}): ReactElement {
  return (
    <Button
      key={obj.key}
      data-testid={obj.key}
      className={`${base}__button`}
      disabled={obj.disabled}
      size="small"
      kind="ghost"
      renderIcon={obj.icon}
      iconDescription={obj.description}
      tooltipPosition="bottom"
      tooltipAlignment="center"
      onClick={obj.onClick}
      hasIconOnly
    />
  );
}

function nextPrevButtonClicked(
  current: number,
  total: number,
  onChange: (page: number) => void,
  change: number
): void {
  const newPage = current + change;
  if (newPage >= 1 && newPage <= total) {
    onChange(newPage);
  }
}

function currentPageChanged(e: Event, onChange: (page: number) => void, inputRef: any): void {
  e.preventDefault();
  const pageInput = Number(inputRef.current.value);
  onChange(pageInput);
}

const PrevToolbar: any = PreviewToolbar;
PrevToolbar.ZOOM_IN = ZOOM_IN;
PrevToolbar.ZOOM_OUT = ZOOM_OUT;
PrevToolbar.ZOOM_RESET = ZOOM_RESET;

export { PrevToolbar as PreviewToolbar };
