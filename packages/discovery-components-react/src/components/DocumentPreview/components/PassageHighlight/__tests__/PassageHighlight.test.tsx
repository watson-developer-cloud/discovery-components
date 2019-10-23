import * as React from 'react';
import { act, render } from '@testing-library/react';
import PassageHighlight from '../PassageHighlight';
import docJson from '../../../__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';
import passages from '../../../__fixtures__/passages';

describe('PassageHighlight', () => {
  it('renders single highlight rect', () => {
    let getAllByTestId: NonNullable<any>;

    act(() => {
      ({ getAllByTestId } = render(
        <PassageHighlight document={docJson} currentPage={13} passage={passages.single} />
      ));
    });

    const highlights = getAllByTestId('highlight');
    expect(highlights).toHaveLength(1);
  });

  it('does not render highlight on non-highlighted page', () => {
    let queryAllByTestId: NonNullable<any>;

    act(() => {
      ({ queryAllByTestId } = render(
        <PassageHighlight document={docJson} currentPage={14} passage={passages.single} />
      ));
    });

    const highlights = queryAllByTestId('highlight');
    expect(highlights).toHaveLength(0);
  });

  it('renders multiple highlight rects', () => {
    let getAllByTestId: NonNullable<any>;

    act(() => {
      ({ getAllByTestId } = render(
        <PassageHighlight document={docJson} currentPage={42} passage={passages.multiline} />
      ));
    });

    const highlights = getAllByTestId('highlight');
    expect(highlights).toHaveLength(3);
  });
});
