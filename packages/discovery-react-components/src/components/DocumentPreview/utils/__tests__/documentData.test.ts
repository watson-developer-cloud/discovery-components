import { getTextMappings } from '../documentData';
import jsonDoc from '../../__fixtures__/Art Effects Koya Creative Base TSA 2008.pdf.json';

const correctTextMapping = {
  extracted_metadata: {
    text_mappings:
      '{"text_mappings":[{"page":{"page_number":1,"bbox":[54.0,89.32704162597656,558.0890502929688,175.20001363754272]},"field":{"name":"text","index":0,"span":[0,757]}}],"pages":[{"page_number":0,"height":792.0,"width":612.0,"origin":"TopLeft"}]}'
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
    expect(mappings).not.toEqual(null);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('returns correct text mapping data', () => {
    const mappings = getTextMappings(correctTextMapping)!;
    expect(mappings).not.toEqual(null);
    expect(mappings.pages[0].page_number).toEqual(0);
    expect(mappings.pages[0].height).toEqual(792);
    expect(mappings.pages[0].width).toEqual(612);
    expect(mappings.pages[0].origin).toEqual('TopLeft');
    expect(consoleError).not.toHaveBeenCalled();
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
