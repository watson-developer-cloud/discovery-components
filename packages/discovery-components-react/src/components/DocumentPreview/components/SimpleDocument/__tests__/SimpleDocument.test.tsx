import React from 'react';
import { act, render } from '@testing-library/react';
import SimpleDocument from '../SimpleDocument';

describe('SimpleDocument', () => {
  const minimalDoc = {
    id: '1234567890',
    extracted_metadata: {
      filename: 'i_am_a_file'
    }
  };

  it('renders a very minimal document', () => {
    act(() => {
      render(<SimpleDocument document={minimalDoc} />);
    });
  });
});
