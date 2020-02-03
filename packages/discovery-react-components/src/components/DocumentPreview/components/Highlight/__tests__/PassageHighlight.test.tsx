import * as React from 'react';
import { act, render } from '@testing-library/react';
import Highlight from '../Highlight';
import docJson from 'components/DocumentPreview/__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';
import passages from 'components/DocumentPreview/__fixtures__/passages';

describe('Highlight', () => {
  // TODO Bad text_mappings are screwing up the tests. The passage start is found as the
  // end of one text_mappings entry and the start of the next, resulting in two
  // highlight rects where we should only have one
  it.skip('renders single highlight rect', () => {
    let getAllByTestId: NonNullable<any>;

    act(() => {
      ({ getAllByTestId } = render(
        <Highlight document={docJson} currentPage={13} highlight={passages.single} />
      ));
    });

    const highlights = getAllByTestId('highlight');
    expect(highlights).toHaveLength(1);
  });

  it('does not render highlight on non-highlighted page', () => {
    let queryAllByTestId: NonNullable<any>;

    act(() => {
      ({ queryAllByTestId } = render(
        <Highlight document={docJson} currentPage={14} highlight={passages.single} />
      ));
    });

    const highlights = queryAllByTestId('highlight');
    expect(highlights).toHaveLength(0);
  });

  it('renders multiple highlight rects', () => {
    let getAllByTestId: NonNullable<any>;

    act(() => {
      ({ getAllByTestId } = render(
        <Highlight document={docJson} currentPage={42} highlight={passages.multiline} />
      ));
    });

    const highlights = getAllByTestId('highlight');
    expect(highlights).toHaveLength(2);
  });
});
