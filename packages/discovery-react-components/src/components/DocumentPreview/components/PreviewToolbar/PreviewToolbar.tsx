import React, { SFC, useRef, useEffect, ReactElement } from 'react';
import { Button, FormLabel, Form, TextInput } from 'carbon-components-react';
import { settings } from 'carbon-components';

import ZoomIn24 from '@carbon/icons-react/es/zoom--in/24.js';
import ZoomOut24 from '@carbon/icons-react/es/zoom--out/24.js';
import CaretLeft24 from '@carbon/icons-react/es/caret--left/24.js';
import CaretRight24 from '@carbon/icons-react/es/caret--right/24.js';
import Reset24 from '@carbon/icons-react/es/reset/24.js';

export const ZOOM_IN = 'zoom-in';
export const ZOOM_OUT = 'zoom-out';
export const ZOOM_RESET = 'reset-zoom';

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
}

const base = `${settings.prefix}--preview-toolbar`;

const PreviewToolbar: SFC<Props> = ({
  loading = false,
  hideControls = false,
  current,
  total,
  onZoom,
  onChange
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current != null) {
      inputRef.current.value = current.toString();
    }
  }, [current]);

  return (
    <div className={`${base}`}>
      {!hideControls ? (
        <>
          <div className={`${base}__spacer`} />
          <div className={`${base}__nav`}>
            {renderButton({
              icon: CaretLeft24,
              description: 'Previous Page',
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
              description: 'Next Page',
              onClick: () => nextPrevButtonClicked(current, total, onChange, 1),
              disabled: loading || current === total
            })}
          </div>
          <div className={`${base}__zoom`}>
            {renderButton({
              icon: ZoomIn24,
              description: 'Zoom In',
              onClick: () => onZoom(ZOOM_IN),
              disabled: loading
            })}
            {renderButton({
              icon: ZoomOut24,
              description: 'Zoom Out',
              onClick: () => onZoom(ZOOM_OUT),
              disabled: loading
            })}
            {renderButton({
              icon: Reset24,
              description: 'Reset Zoom',
              onClick: () => onZoom(ZOOM_RESET),
              disabled: loading
            })}
          </div>
        </>
      ) : null}
    </div>
  );
};

function renderButton(obj: {
  icon: React.Component;
  description: string;
  onClick: () => void;
  disabled: boolean;
}): ReactElement {
  return (
    <Button
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
