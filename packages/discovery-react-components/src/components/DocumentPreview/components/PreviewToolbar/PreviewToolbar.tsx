import React, { FC, useRef, useEffect, ReactElement, ComponentType } from 'react';
import cx from 'classnames';
import { Button, FormLabel, Form, TextInput } from 'carbon-components-react';
import { settings } from 'carbon-components';

import { ZoomIn24 } from '@carbon/icons-react';
import { ZoomOut24 } from '@carbon/icons-react';
import { ChevronUp24 } from '@carbon/icons-react';
import { ChevronDown24 } from '@carbon/icons-react';
import { Reset24 } from '@carbon/icons-react';

import { defaultMessages, Messages } from '../../messages';

export const ZOOM_IN = 'zoom-in';
export const ZOOM_OUT = 'zoom-out';
export const ZOOM_RESET = 'reset-zoom';

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

interface Props {
  /**
   * Show loading state
   */
  loading?: boolean;

  /**
   * Hide pager and zoom toolbar controls
   */
  hideControls?: boolean;

  /**
   * User actions displayed on the end of the toolbar
   */
  userActions?: ToolbarAction[];

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

const PreviewToolbar: FC<Props> = ({
  loading = false,
  hideControls = false,
  userActions = [],
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

  const msgs = { ...defaultMessages, ...messages };
  return (
    <div className={cx(base, { [`${base}__hidden`]: hideControls && userActions.length === 0 })}>
      <div className={`${base}__left`}>
        {!hideControls && (
          <div className={`${base}__nav`}>
            {renderButton({
              renderIcon: ChevronUp24,
              iconDescription: msgs.previousPageLabel,
              onClick: () => nextPrevButtonClicked(current, total, onChange, -1),
              disabled: loading || current === 1
            })}
            {renderButton({
              renderIcon: ChevronDown24,
              iconDescription: msgs.nextPageLabel,
              onClick: () => nextPrevButtonClicked(current, total, onChange, 1),
              disabled: loading || current === total
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
            <FormLabel className={`${base}__pageLabel`}>/ {msgs.formatTotalPages(total)}</FormLabel>
          </div>
        )}
      </div>
      <div className={`${base}__center ${base}__nav`}></div>
      <div className={`${base}__right`}>
        {!hideControls && (
          <>
            {renderButton({
              renderIcon: ZoomIn24,
              iconDescription: msgs.zoomInLabel,
              onClick: () => onZoom(ZOOM_IN),
              disabled: loading
            })}
            {renderButton({
              renderIcon: ZoomOut24,
              iconDescription: msgs.zoomOutLabel,
              onClick: () => onZoom(ZOOM_OUT),
              disabled: loading
            })}
            {renderButton({
              renderIcon: Reset24,
              iconDescription: msgs.resetZoomLabel,
              onClick: () => onZoom(ZOOM_RESET),
              disabled: loading
            })}
          </>
        )}
        {userActions.map((action, index) =>
          renderUserAction({
            ...action,
            key: `toolbar-action-${action.id || index}`
          })
        )}
      </div>
    </div>
  );
};

function renderUserAction(action: ToolbarAction & { key: string }) {
  if (action['renderIcon']) {
    return renderButton(action as ToolbarButton & { key: string });
  } else if (action['render']) {
    const { key, ...item } = action as ToolbarItem & { key: string };
    const Component = item.render;
    return <Component key={action.key} />;
  }
  return null;
}

function renderButton(obj: {
  key?: string;
  className?: string;
  renderIcon: React.Component;
  iconDescription: string;
  onClick: () => void;
  disabled?: boolean;
}): ReactElement {
  const { key, className, ...buttonProps } = obj;
  return (
    <Button
      key={key}
      data-testid={key}
      className={cx(`${base}__button`, className)}
      size="small"
      kind="ghost"
      tooltipPosition="bottom"
      tooltipAlignment="center"
      hasIconOnly
      {...buttonProps}
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
