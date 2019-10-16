import React from 'react';
import {
  act,
  cleanup,
  render,
  waitForElement,
  BoundFunction,
  GetByText
} from '@testing-library/react';
import PdfFallback from '../PdfFallback';
import docJson from '../../../__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';

describe('PdfFallback', () => {
  afterEach(cleanup);

  it('Verify number of line generated is accurate', async () => {
    let container: HTMLElement;
    act(() => {
      ({ container } = render(<PdfFallback document={docJson} currentPage={1} />));
    });

    const svgTag = await waitForElement<SVGElement>(() => {
      const svgTag = container.querySelector('svg');
      if (!svgTag) {
        throw new Error();
      }
      return svgTag;
    });

    if (svgTag !== null) {
      expect(svgTag.children.length).toEqual(31);
    } else {
      throw new Error('expected to find SVG element');
    }
  });

  it('Verify the right values are being put on the page', async () => {
    let getByText: BoundFunction<GetByText> = () => {
      throw new Error();
    };

    act(() => {
      ({ getByText } = render(<PdfFallback document={docJson} currentPage={1} />));
    });

    await waitForElement(() => getByText('1.0 Definitions'));

    getByText('1.0 Definitions');
    getByText(
      'materials basis as set out in the relevant SOW and charged in accordance with Clause 5 (Pricing) and additional terms within'
    );
  });
});
