import * as React from 'react';
import { act, render, FindByText, GetByText, BoundFunction } from '@testing-library/react';
import PdfViewer from '../PdfViewer';
import { document as doc } from '../../../__fixtures__/Art Effects.pdf';

describe('PdfViewer', () => {
  let findByText: BoundFunction<FindByText>, getByTestId: BoundFunction<GetByText>;

  beforeEach(async done => {
    await act(async () => {
      ({ findByText, getByTestId } = await render(
        <PdfViewer
          file={doc}
          page={1}
          scale={1}
          setPageCount={(): void => {}}
          setLoading={(): void => {}}
        />
      ));
    });
    done();
  });

  it('renders PDF document', () => {
    // await findByText('Technical Services Agreement', { exact: false });

    const page = getByTestId('pdf-view');
    console.log(page.firstChild);
    const canvasList = document.querySelectorAll('canvas');
    expect(canvasList.length).toBe(1);
  });
});
