import * as React from 'react';
import { act, render, waitForElement } from '@testing-library/react';
import Highlight from '../Highlight';
import docJson from '../../../__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';

const tableResult = {
  table_id: '558ada041262d5b0aa02a05429d798c7',
  source_document_id: '7e8ada041262d5b0aa02a05429d798c7',
  collection_id: '8713a92b-28aa-b291-0000-016ddc68aa2a',
  table_html: '<table><tr><th>Hello</th><tr><td>How are ya?</td></tr></table>',
  table_html_offset: 42500,
  table: {
    location: {
      begin: 346183,
      end: 349624
    }
  }
};

describe('Highlight', () => {
  it('renders highlight', async () => {
    let getAllByTestId: NonNullable<any>;

    act(() => {
      ({ getAllByTestId } = render(
        <Highlight document={docJson} currentPage={39} highlight={tableResult} />
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
