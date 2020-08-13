import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { PreviewToolbar } from '../PreviewToolbar';

const { ZOOM_IN, ZOOM_OUT, ZOOM_RESET } = PreviewToolbar;

let current = 5;
let zoomLevel = '';

const pageUpdate = (newPage: number): void => {
  current = newPage;
};

const zoomUpdate = (newZoom: string): void => {
  zoomLevel = newZoom;
};

describe('PreviewToolbar', () => {
  let wrapper: any;
  let toolbarButtons: any;

  beforeEach(() => {
    wrapper = render(
      <PreviewToolbar current={current} total={10} onZoom={zoomUpdate} onChange={pageUpdate} />
    );
    toolbarButtons = wrapper.getAllByRole('button');
  });

  it('goes to the next page', () => {
    fireEvent.click(toolbarButtons[1]);

    expect(current).toEqual(6);
  });

  it('goes to the previous page', () => {
    fireEvent.click(toolbarButtons[0]);

    expect(current).toEqual(5);
  });

  it('goes to page 7', () => {
    const toolbarInput = wrapper.getByRole('spinbutton');
    const toolbarForm = toolbarInput.closest('form');

    toolbarInput.value = 7;
    fireEvent.submit(toolbarForm);
    expect(current).toEqual(7);
  });

  it('zooms in when clicked', () => {
    fireEvent.click(toolbarButtons[2]);

    expect(zoomLevel).toEqual(ZOOM_IN);
  });

  it('zooms out when clicked', () => {
    fireEvent.click(toolbarButtons[3]);

    expect(zoomLevel).toEqual(ZOOM_OUT);
  });

  it('reset zoom when clicked', () => {
    fireEvent.click(toolbarButtons[4]);

    expect(zoomLevel).toEqual(ZOOM_RESET);
  });
});
