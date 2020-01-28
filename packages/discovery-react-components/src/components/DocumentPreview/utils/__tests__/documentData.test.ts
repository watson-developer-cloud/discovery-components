import { getTextMappings } from '../documentData';
import jsonDoc from '../../__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';

const correctTextMapping = {
  extracted_metadata: {
    text_mappings:
      '{"text_mappings":[{"page":{"page_number":1,"bbox":[54.0,89.32704162597656,558.0890502929688,175.20001363754272]},"field":{"name":"text","index":0,"span":[0,757]}}'
  }
};

const noTextMapping = {
  extracted_metadata: {}
};

const invalidStringTextMapping = {
  extracted_metadata: {
    text_mappings:
      'I have replaced to usual text mapping string here for a test. This should give an error.'
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
    console.log(mappings);
    expect(mappings).not.toEqual(null);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it.skip('returns correct text mapping data', () => {
    const mappings = getTextMappings(correctTextMapping);
    console.log(mappings);
  });

  it('fails gracefully if text mappings does not exist', () => {
    const mappings = getTextMappings(noTextMapping);
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
});
