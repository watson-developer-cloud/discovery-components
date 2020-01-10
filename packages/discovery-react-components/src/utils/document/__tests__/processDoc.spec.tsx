/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';
import { render } from '@testing-library/react';
import parser from 'fast-xml-parser';
import { processDoc, ProcessedDoc } from '../processDoc';
import contractData from '../__fixtures__/contract.json';
import escapedCharData from '../__fixtures__/escaped_char_document.json';
import invoiceData from 'components/CIDocument/components/CIDocument/__fixtures__/invoice-index_op.json';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';

expect.extend({
  toBeValidXml(received): any {
    const result = parser.validate(received);
    const pass = result === true;

    const message = pass
      ? (): string => this.utils.matcherHint('toBeValidXml') + '\n\nExpected value to not be valid'
      : (): string =>
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
    // parse doc for use in tests
    doc = await processDoc(contractData.results[0], { sections: true });
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

    const { begin, end } = section.location;
    const childBegin = parseInt(nodes[0].getAttribute('data-child-begin') || '', 10);
    const childEnd = parseInt(nodes[0].getAttribute('data-child-end') || '', 10);

    // child begin/end values should be within section begin/end values
    expect(childBegin).toBeGreaterThanOrEqual(begin);
    expect(childBegin).toBeLessThan(end);
    expect(childEnd).toBeGreaterThan(begin);
    expect(childEnd).toBeLessThanOrEqual(end);

    // begin should be less than end
    expect(begin).toBeLessThan(end);
    expect(childBegin).toBeLessThan(childEnd);
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
});

describe('processDoc', () => {
  let doc: ProcessedDoc;

  beforeAll(async () => {
    // parse doc for use in tests
    doc = await processDoc(escapedCharData, { sections: true });
  });

  it('parses document data with escaped characters', () => {
    expect(doc.sections).toHaveLength(98);
  });

  it('produces valid HTML/XML for data with escaped characters', () => {
    // validate HTML (XML) for some sections
    for (const idx of [0, 20, 40, 60, 80]) {
      const section = doc.sections![idx];
      (expect(section.html) as any).toBeValidXml();
    }
  });

  it('renders as correct entities', () => {
    const tests = [{ idx: 0, test: '<' }, { idx: 47, test: '‹' }, { idx: 51, test: '™' }];

    tests.forEach(({ idx, test }) => {
      const section = doc.sections![idx];
      const { getByText } = render(<div dangerouslySetInnerHTML={{ __html: section.html }} />);

      getByText(test, { exact: false });
    });
  });
});

describe('processDoc', () => {
  const clonedData = cloneDeep(contractData.results[0]);

  beforeAll(async () => {
    // parse doc for use in tests
    await processDoc(clonedData, { sections: true });
  });

  it('does not mutate the passed contracts data and metadata is not be present in original data', () => {
    expect(isEqual(clonedData, contractData.results[0])).toBeTruthy();
    expect(get(contractData.results[0], 'enriched_html[0].contract.metadata')).toBeUndefined();
  });

  it('does not mutate the passed document data and attributes and relations properties are not present in the original data', async () => {
    const clonedInvoiceData = cloneDeep(invoiceData);
    await processDoc(clonedInvoiceData, { sections: true });
    expect(isEqual(clonedInvoiceData, invoiceData)).toBeTruthy();
    expect(get(invoiceData, 'enriched_html[0].invoice.attributes')).toBeUndefined();
    expect(get(invoiceData, 'enriched_html[0].invoice.relations')).toBeUndefined();
  });
});
