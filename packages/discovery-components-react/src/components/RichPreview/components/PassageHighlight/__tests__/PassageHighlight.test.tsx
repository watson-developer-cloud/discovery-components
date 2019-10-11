import * as React from 'react';
import { act, render } from '@testing-library/react';
import PassageHighlight from '../PassageHighlight';
import docJson from '../../../__fixtures__/WEA.Glossary.pdf.json';
import passages from '../../../__fixtures__/passages';

describe('PassageHighlight', () => {
  it('renders single highlight rect', () => {
    let getAllByTestId: NonNullable<any>;

    act(() => {
      ({ getAllByTestId } = render(
        <PassageHighlight document={docJson} currentPage={1} passage={passages.single} />
      ));
    });

    const highlights = getAllByTestId('highlight');
    expect(highlights).toHaveLength(1);
  });

  it('renders multiple highlight rects', () => {
    let getAllByTestId: NonNullable<any>;

    act(() => {
      ({ getAllByTestId } = render(
        <PassageHighlight document={docJson} currentPage={1} passage={passages.multiline} />
      ));
    });

    const highlights = getAllByTestId('highlight');
    expect(highlights).toHaveLength(4);
  });
});
