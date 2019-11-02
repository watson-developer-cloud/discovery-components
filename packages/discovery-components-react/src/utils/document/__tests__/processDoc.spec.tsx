import React from 'react';
import { render } from '@testing-library/react';
import parser from 'fast-xml-parser';
import processDoc, { ProcessedDoc } from '../processDoc';
import { ParsingError } from '../saxesParser';
import contractData from '../__fixtures__/contract.json';

expect.extend({
  toBeValidXml(received) {
    const result = parser.validate(received);
    const pass = result === true;

    const message = pass
      ? () => this.utils.matcherHint('toBeValidXml') + '\n\nExpected value to not be valid'
      : () =>
          this.utils.matcherHint('toBeValidXml') +
          '\n\n' +
          `Expected value to be valid\n` +
          `Result: ${this.utils.printReceived(result)}`;

    return { actual: received, message, pass };
  }
});

describe('processDoc', () => {
  let doc: ProcessedDoc;

  beforeAll(async () => {
    // don't show console.error messages during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // parse doc for use in tests
    doc = await processDoc(contractData.results[0], { sections: true });
  });

  afterAll(() => {
    // eslint-disable-next-line no-console
    (console.error as any).mockRestore();
  });

  it('parses Disco document data', () => {
    expect(doc.styles).toHaveLength(2029);
    expect(doc.sections).toHaveLength(237);
  });

  it('produces valid HTML/XML', () => {
    // validate HTML (XML) for some sections
    for (const idx of [0, 40, 80, 145, 235]) {
      const section = doc.sections![idx];
      (expect(section.html) as any).toBeValidXml();
    }
  });

  it('generates begin/end data props in HTML', () => {
    const section = doc.sections![10];
    const { container } = render(<div dangerouslySetInnerHTML={{ __html: section.html }} />);

    expect(container.querySelectorAll('span')).toHaveLength(2);

    const nodes = container.querySelectorAll('[data-child-begin]');
    expect(nodes).toHaveLength(5);

    expect(parseInt(nodes[0].getAttribute('data-child-begin') || '', 10)).toEqual(
      section.location.begin
    );
    expect(parseInt(nodes[0].getAttribute('data-child-end') || '', 10)).toEqual(
      section.location.end
    );
  });

  // it('removes bbox nodes', () => {
  //   const section = doc.sections[220];
  //   const wrapper = render(<div dangerouslySetInnerHTML={{ __html: section.html }} />);

  //   expect(wrapper.find('bbox')).toHaveLength(0);
  // });

  it('create enrichments array', () => {
    const section = doc.sections![164];
    expect(section.enrichments).toHaveLength(9);
  });

  it('throws error for invalid data', async () => {
    const badDoc = {
      // missing BODY closing tag
      html: `<?xml version='1.0' encoding='UTF-8' standalone='yes'?>
              <html>
                <head></head>
                <body>
              </html>`,
      enriched_html_elements: []
    };
    await expect(processDoc(badDoc)).rejects.toThrow(ParsingError);
  });
});
