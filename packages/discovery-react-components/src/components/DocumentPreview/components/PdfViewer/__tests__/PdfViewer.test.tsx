import * as React from 'react';
import { act, render } from '@testing-library/react';
import PdfViewer from '../PdfViewer';
import { document as doc } from 'components/DocumentPreview/__fixtures__/Art Effects.pdf';

describe('PdfViewer', () => {
  it('renders PDF document', () => {
    act(() => {
      render(
        <PdfViewer
          file={doc}
          page={1}
          scale={1}
          setPageCount={(): void => {}}
          setLoading={(): void => {}}
        />
      );
    });

    const canvasList = document.querySelectorAll('canvas');
    expect(canvasList.length).toBe(1);
  });
});
