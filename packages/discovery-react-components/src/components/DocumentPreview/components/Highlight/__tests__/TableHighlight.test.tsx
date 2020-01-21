import * as React from 'react';
import { act, render, waitForElement } from '@testing-library/react';
import Highlight from '../Highlight';
import docJson from 'components/DocumentPreview/__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';

const tableResult = {
  table_id: 'c120373e-34fc-428d-b442-29e20679bc7f',
  source_document_id: '903461f8843ef9f10daecd2a14994308',
  collection_id: 'd1714ef9-647c-288c-0000-016fa082490f',
  table_html: 'Something',
  table_html_offset: 238525,
  table: {
    location: { begin: 230169, end: 234407 }
  }
};

describe.skip('TableHighlight', () => {
  it('renders highlight', async () => {
    let getAllByTestId: NonNullable<any>;

    act(() => {
      ({ getAllByTestId } = render(
        <Highlight document={docJson} currentPage={46} highlight={tableResult} />
      ));
    });

    const highlights = await waitForElement<SVGElement>(() => getAllByTestId('highlight'));
    expect(highlights).toHaveLength(10);
  });

  it('does not render highlight on non-highlighted page', async () => {
    let container: HTMLElement, queryAllByTestId: NonNullable<any>;

    act(() => {
      ({ container, queryAllByTestId } = render(
        <Highlight document={docJson} currentPage={40} highlight={tableResult} />
      ));
    });

    // wait for Highlight element to render
    await waitForElement<SVGElement>(() => {
      const svgTag = container.querySelector('svg');
      if (!svgTag) {
        throw new Error();
      }
      return svgTag;
    });

    const highlights = queryAllByTestId('highlight');
    expect(highlights).toHaveLength(0);
  });
});
