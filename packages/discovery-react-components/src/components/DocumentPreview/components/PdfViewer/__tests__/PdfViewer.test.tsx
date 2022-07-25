import * as React from 'react';
import { render, waitFor } from '@testing-library/react';
import PdfViewer from '../PdfViewer';
import { document as doc } from 'components/DocumentPreview/__fixtures__/Art Effects.pdf';

describe('PdfViewer', () => {
  it('renders PDF document', async () => {
    render(<PdfViewer file={atob(doc)} page={1} scale={1} setLoading={(): void => {}} />);

    // wait for component to finish rendering (prevent "act" warning)
    await waitFor(() => expect(document.querySelectorAll('canvas')).toBeDefined());

    const canvasList = document.querySelectorAll('canvas');
    expect(canvasList.length).toBe(1);
  });
});
