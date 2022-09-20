import * as React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
// PDF.js uses web streams, which aren't defined in jest/JSDOM
import 'web-streams-polyfill/es2018';
import PdfViewer from '../PdfViewer';
import { document as doc } from 'components/DocumentPreview/__fixtures__/Art Effects.pdf';

describe('PdfViewer', () => {
  it('renders PDF document', async () => {
    render(<PdfViewer file={atob(doc)} page={1} scale={1} setLoading={(): void => {}} />);

    // wait for component to finish rendering (prevent "act" warning)
    await waitFor(() => expect(screen.getByText('ART EFFECTS LIMITED')).toBeVisible());

    const canvasList = document.querySelectorAll('canvas');
    expect(canvasList.length).toBe(1);
  }, 30000);
});
