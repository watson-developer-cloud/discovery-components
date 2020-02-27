import React from 'react';
import { render } from '@testing-library/react';
import { getDocumentTitle } from '../index';

const mockResultWithTitle = {
  document_id: 'df4c085040a9049ddf956ca6a213699d',
  extracted_metadata: {
    file_type: 'html',
    title: 'Family Day 2020 (Israel)'
  }
};

const mockResultWithoutTitle = {
  document_id: 'df4c085040a9049ddf956ca6a213699d',
  extracted_metadata: {
    file_type: 'html'
  }
};

const mockResultWithFilename = {
  document_id: 'df4c085040a9049ddf956ca6a213699d',
  extracted_metadata: {
    file_type: 'html',
    filename: 'Family Day 2020 (Israel)'
  }
};

describe('getDocumentTitle', () => {
  test('returns result title', () => {
    expect(getDocumentTitle('title', mockResultWithTitle)).toEqual(
      mockResultWithTitle.extracted_metadata.title
    );
  });

  test('returns result document id', () => {
    expect(getDocumentTitle('title', mockResultWithoutTitle)).toEqual(
      mockResultWithoutTitle.document_id
    );
  });

  test('returns result file name', () => {
    expect(getDocumentTitle('title', mockResultWithFilename)).toEqual(
      mockResultWithFilename.extracted_metadata.filename
    );
  });
});
