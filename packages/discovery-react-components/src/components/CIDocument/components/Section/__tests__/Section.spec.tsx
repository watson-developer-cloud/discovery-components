import React from 'react';
import { act, render, waitForElement } from '@testing-library/react';
import '../../../../../utils/test/createRange.mock';
import Section from '../Section';
import sectionData from '../__fixtures__/sectionData';

describe('<Section />', () => {
  it('renders section HTML', async () => {
    const data = {
      html: '<p class="foobar">Here I am!</p>',
      location: {
        begin: 123,
        end: 456
      }
    };

    let getByText: NonNullable<Function>;
    act(() => {
      ({ getByText } = render(<Section section={data} />));
    });

    await waitForElement(() => getByText('Here I am!'));
  });

  it('renders enrichment fields', async () => {
    let getAllByTestId: NonNullable<Function>;
    act(() => {
      ({ getAllByTestId } = render(<Section section={sectionData[0]} />));
    });

    const fields = await waitForElement(() => getAllByTestId('field-rect'));
    expect(fields.length).toEqual(6);
  });
});
