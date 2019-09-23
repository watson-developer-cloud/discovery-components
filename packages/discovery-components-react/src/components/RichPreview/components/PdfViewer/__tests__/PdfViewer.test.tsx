import * as React from 'react';
import { act, render } from '@testing-library/react';
import PdfViewer from '../PdfViewer';
import { document as doc } from '../../../__fixtures__/intro_to_watson_discovery';

describe('PdfViewer', () => {
  it('renders PDF document', async () => {
    act(() => {
      render(<PdfViewer file={atob(doc)} page={1} scale={1} />);
    });

    const canvasList = document.querySelectorAll('canvas');
    expect(canvasList.length).toBe(1);
  });
});
