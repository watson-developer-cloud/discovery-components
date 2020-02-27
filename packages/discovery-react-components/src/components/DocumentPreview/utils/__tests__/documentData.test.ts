import { getTextMappings, isCsvFile, isJsonFile } from '../documentData';
import jsonDoc from '../../__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';

describe('documentData', () => {
  const noMetadata = {
    extracted_metadata: {}
  };

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

  const correctTextMapping = {
    extracted_metadata: {
      text_mappings:
        '{"text_mappings":[{"page":{"page_number":1,"bbox":[54.0,89.32704162597656,558.0890502929688,175.20001363754272]},"field":{"name":"text","index":0,"span":[0,757]}}],"pages":[{"page_number":0,"height":792.0,"width":612.0,"origin":"TopLeft"}]}'
    }
  };
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

  const invalidStringTextMapping = {
    extracted_metadata: {
      text_mappings:
        'I have replaced to usual text mapping string here for a test. This should give an error.'
    }
  };
  it('fails gracefully if text mappings cannot be parsed', () => {
    const mappings = getTextMappings(invalidStringTextMapping);
    expect(mappings).toEqual(null);
    expect(consoleError).toHaveBeenCalled();
  });

  const noStringTextMapping = {
    extracted_metadata: {
      text_mappings: 1
    }
  };
  it('fails gracefully if text mappings is not a string', () => {
    const mappings = getTextMappings(noStringTextMapping);
    expect(mappings).toEqual(null);
    expect(consoleError).toHaveBeenCalled();
  });

  const jsonFileType = {
    extracted_metadata: {
      file_type: 'json'
    }
  };
  it('returns true if the document is a JSON file', () => {
    const docTypeJson = isJsonFile(jsonFileType);
    expect(docTypeJson).toEqual(true);
  });

  const csvFileType = {
    extracted_metadata: {
      file_type: 'csv'
    }
  };
  it('returns true if the document is a CSV file', () => {
    const docTypeJson = isCsvFile(csvFileType);
    expect(docTypeJson).toEqual(true);
  });

  const noStringFileType = {
    extracted_metadata: {
      file_type: true
    }
  };
  it('returns false if the file type provided is not a string', () => {
    const falseDocType = isJsonFile(noStringFileType);
    expect(falseDocType).toEqual(false);
  });

  it('returns false if there is no file type provided', () => {
    const falseDocType = isCsvFile(noMetadata);
    expect(falseDocType).toEqual(false);
  });
});
