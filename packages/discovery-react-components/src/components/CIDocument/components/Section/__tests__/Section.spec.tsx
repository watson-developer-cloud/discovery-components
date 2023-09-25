import React from 'react';
import { screen, act, render } from '@testing-library/react';
import 'utils/test/createRange.mock';
import Section from '../Section';
import sectionData from '../__fixtures__/sectionData';
import { defineDOMRect, removeDOMRect } from 'setupTestsUtil';

describe('<Section />', () => {
  beforeEach(() => {
    defineDOMRect();
  });
  afterEach(() => {
    removeDOMRect();
  });
  it('renders section HTML', async () => {
    const data = {
      html: '<p class="foobar">Here I am!</p>',
      location: {
        begin: 123,
        end: 456
      }
    };

    act(() => {
      render(<Section section={data} />);
    });

    await screen.findByText('Here I am!');
  });

  it('renders enrichment fields', async () => {
    const { findAllByTestId } = render(<Section section={sectionData[0]} />);

    const fields = await findAllByTestId('field-rect');
    expect(fields.length).toEqual(6);
  });
});
