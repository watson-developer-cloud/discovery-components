import React from 'react';
import { screen, render } from '@testing-library/react';
import CIDocumentContent from '../CIDocumentContent';

describe('<CIDocumentContent />', () => {
  // NOTE: This not test the `VirtualScroll` due to sizing issues

  it('renders document', async () => {
    const styles = ['.foobar{font-size: super-large-foobar; display: offensive}'];
    const sections = [
      {
        html: '<p class="foobar">Here I am!</p>',
        location: {
          begin: 123,
          end: 456
        }
      }
    ];

    render(
      <CIDocumentContent
        styles={styles}
        sections={sections}
        itemMap={{ byItem: {}, bySection: {} }}
      />
    );

    let styleNode = await screen.findByTestId('style');
    expect(styleNode.innerHTML.includes('super-large-foobar')).toBe(true);
    expect(styleNode.innerHTML.includes('offensive')).toBe(true);
  });
});
