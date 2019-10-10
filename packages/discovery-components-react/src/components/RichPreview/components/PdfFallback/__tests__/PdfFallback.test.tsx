import React from 'react';
import { cleanup, render } from '@testing-library/react';
import PdfFallback from '../PdfFallback';
import docJson from '../../../__fixtures__/WEA.Glossary.pdf.json';

afterEach(cleanup);

describe('PdfFallback', () => {
  it('Verify number of line generated is accurate', () => {
    const { container } = render(<PdfFallback document={docJson} currentPage={1} />);

    const svgTags = container.querySelector('svg');

    if (svgTags !== null) {
      expect(svgTags.children.length).toEqual(28);
    }
  });

  it('Verify the right values are being put on the page', () => {
    const { getByText } = render(<PdfFallback document={docJson} currentPage={1} />);
    getByText('Accuracy');
    getByText(
      'The precision of the answers returned if all questions are answered. Accuracy can be measured in'
    );
  });
});
