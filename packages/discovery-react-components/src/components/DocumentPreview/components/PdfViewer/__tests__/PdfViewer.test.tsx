import * as React from 'react';
import { act, render } from '@testing-library/react';
import PdfViewer from '@DocumentPreview/components/PdfViewer/PdfViewer';
import { document as doc } from '@DocumentPreview/__fixtures__/Art Effects.pdf';

describe('PdfViewer', () => {
  it('renders PDF document', () => {
    act(() => {
      render(<PdfViewer file={atob(doc)} page={1} scale={1} setLoading={(): void => {}} />);
    });

    const canvasList = document.querySelectorAll('canvas');
    expect(canvasList.length).toBe(1);
  });
});
