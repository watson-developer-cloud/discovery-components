import { getDocumentTitle } from '../getDocumentTitle';

describe('getDocumentTitle', () => {
  test('returns result title', () => {
    const mockResultWithTitle = {
      document_id: 'df4c085040a9049ddf956ca6a213699d',
      extracted_metadata: {
        file_type: 'html',
        title: 'Family Day 2020 (Israel)'
      }
    };
    expect(getDocumentTitle(mockResultWithTitle, 'title')).toEqual(
      mockResultWithTitle.extracted_metadata.title
    );
  });

  test('returns result file name if title is not available', () => {
    const mockResultWithFilename = {
      document_id: 'df4c085040a9049ddf956ca6a213699d',
      extracted_metadata: {
        file_type: 'html',
        filename: 'Family Day 2020 (Israel)'
      }
    };
    expect(getDocumentTitle(mockResultWithFilename, 'title')).toEqual(
      mockResultWithFilename.extracted_metadata.filename
    );
  });

  test('returns result document id if title and filename are not available', () => {
    const mockResultWithoutTitle = {
      document_id: 'df4c085040a9049ddf956ca6a213699d',
      extracted_metadata: {
        file_type: 'html'
      }
    };
    expect(getDocumentTitle(mockResultWithoutTitle, 'title')).toEqual(
      mockResultWithoutTitle.document_id
    );
  });
});
