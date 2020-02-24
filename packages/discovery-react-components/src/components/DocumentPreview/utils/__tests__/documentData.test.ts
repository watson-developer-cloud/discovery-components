import { getTextMappings, getDocumentType } from '../documentData';
import jsonDoc from '../../__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';

const correctTextMapping = {
  extracted_metadata: {
    file_type: 'json',
    text_mappings:
      '{"text_mappings":[{"page":{"page_number":1,"bbox":[54.0,89.32704162597656,558.0890502929688,175.20001363754272]},"field":{"name":"text","index":0,"span":[0,757]}}],"pages":[{"page_number":0,"height":792.0,"width":612.0,"origin":"TopLeft"}]}'
  }
};

const noMetadata = {
  extracted_metadata: {}
};

const invalidStringTextMapping = {
  extracted_metadata: {
    text_mappings:
      'I have replaced to usual text mapping string here for a test. This should give an error.'
  }
};

const noStringFileType = {
  extracted_metadata: {
    file_type: 12
  }
};

const noStringTextMapping = {
  extracted_metadata: {
    text_mappings: 1
  }
};

describe('documentData', () => {
  let consoleError: jest.SpyInstance<any, any>;

  beforeAll(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleError.mockRestore();
  });

  it('succeeds in getting text mapping from json file', () => {
    const mappings = getTextMappings(jsonDoc);
    expect(mappings).not.toEqual(null);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('returns correct text mapping data', () => {
    const mappings = getTextMappings(correctTextMapping)!;
    expect(mappings).not.toEqual(null);
    expect(mappings.pages[0]).toEqual({
      page_number: 0,
      height: 792,
      width: 612,
      origin: 'TopLeft'
    });
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('fails gracefully if text mappings does not exist', () => {
    const mappings = getTextMappings(noMetadata);
    expect(mappings).toEqual(null);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('fails gracefully if text mappings cannot be parsed', () => {
    const mappings = getTextMappings(invalidStringTextMapping);
    expect(mappings).toEqual(null);
    expect(consoleError).toHaveBeenCalled();
  });

  it('fails gracefully if text mappings is not a string', () => {
    const mappings = getTextMappings(noStringTextMapping);
    expect(mappings).toEqual(null);
    expect(consoleError).toHaveBeenCalled();
  });

  it('returns the correct document type', () => {
    const docType = getDocumentType(correctTextMapping);
    expect(docType).toEqual('json');
  });

  it('returns null if the file type provided is not a string', () => {
    const docType = getDocumentType(noStringFileType);
    expect(docType).toEqual(null);
  });

  it('returns null if there is no file type provided', () => {
    const docType = getDocumentType(noMetadata);
    expect(docType).toEqual(null);
  });
});
