import React from 'react';
import { cleanup, render } from '@testing-library/react';
import PdfFallback from '../PdfFallback';
import docJson from '../../../__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';

afterEach(cleanup);

describe('PdfFallback', () => {
  it('Verify number of line generated is accurate', () => {
    const { container } = render(<PdfFallback document={docJson} currentPage={1} />);

    const svgTags = container.querySelector('svg');

    if (svgTags !== null) {
      expect(svgTags.children.length).toEqual(31);
    }
  });

  it('Verify the right values are being put on the page', () => {
    const { getByText } = render(<PdfFallback document={docJson} currentPage={1} />);
    getByText('1.0 Definitions');
    getByText(
      'materials basis as set out in the relevant SOW and charged in accordance with Clause 5 (Pricing) and additional terms within'
    );
  });
});
