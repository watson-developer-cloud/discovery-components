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
    const tests = [
      { idx: 0, test: '<' },
      { idx: 47, test: '‹' },
      { idx: 51, test: '™' }
    ];

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

describe('processDoc', () => {
  it('stores original un-encoded text in attribute', async () => {
    const html = `<html>
      <body>
        <p data-testid="one">one two three four</p>
        <p data-testid="two">five &amp; six</p>
      </body>
    </html>`;

    const doc = await processDoc({ html }, { sections: true });
    const processedHtml = doc.sections!.map(section => section.html).join('');
    const { getByTestId } = render(<div dangerouslySetInnerHTML={{ __html: processedHtml }} />);

    const elemOne = getByTestId('one');
    const elemTwo = getByTestId('two');

    expect(elemOne.getAttribute('data-orig-text')).toBeFalsy();
    expect(elemTwo.textContent).toEqual('five & six');
    expect(elemTwo.getAttribute('data-orig-text')).toEqual('five &amp; six');
  });

  it('successfully picks up tables', async () => {
    const html = `<html>
      <body>
        <table data-testid="table-one"><th>Table 1</th></table>
        <ul>
          <table data-testid="table-two"><th>Table 2</th></table>
        </ul>
        <table data-testid="table-three">
          <tr>
            <td><p><span>
              <bbox x="40.7528076171875" y="74.65092468261719" page="1" height="8.111161231994629" width="19.334335327148438">
                Column 1
              </bbox>
            </span></p></td>
            <td><p><span>
              <bbox x="73.0099105834961" y="74.65092468261719" page="1" height="8.111161231994629" width="59.33922576904297">
                Column 2
              </bbox>
            </span></p></td>  
          </tr>
        </table>
      </body>
    </html>`;

    const bboxData = {
      left: 40.7528076171875,
      right: 60.08714294433594,
      top: 74.65092468261719,
      bottom: 82.76208591461182,
      page: 1,
      className: '',
      location: {
        begin: 274,
        end: 0
      }
    };

    const doc = await processDoc({ html }, { sections: true, tables: true });
    const processedHtml = doc.sections!.map(section => section.html).join('');
    const { getByTestId } = render(<div dangerouslySetInnerHTML={{ __html: processedHtml }} />);

    const tableOne = getByTestId('table-one');
    const tableTwo = getByTestId('table-two');
    const tableThree = getByTestId('table-three');
    expect(tableOne.textContent).toEqual('Table 1');
    expect(tableTwo.textContent).toEqual('Table 2');
    expect(tableThree.textContent).toContain('Column 1');
    expect(tableThree.textContent).toContain('Column 2');

    expect(doc.tables!.length).toEqual(3);
    expect(doc.tables![0].location).toEqual({ begin: 28, end: 82 });
    expect(doc.tables![2].bboxes.length).toEqual(2);
    expect(doc.tables![2].bboxes[0]).toEqual(bboxData);
  });
});

describe('processDoc', () => {
  let doc: ProcessedDoc;

  beforeAll(async () => {
    // parse doc for use in tests
    doc = await processDoc(contractData.results[0], { bbox: true, bboxInnerText: true });
  });

  it('successfully picks up bboxes', () => {
    expect(doc.bboxes).toHaveLength(1584);
  });

  it('successfully picks up bbox text source', () => {
    expect(doc.bboxes).toHaveLength(1584);

    // <bbox height="19.872972011566162" page="1" width="506.5294189453125" x="54.0" y="89.32704162597656">
    // On 22 December 2008 ART EFFECTS LIMITED and Customer entered into an Information Technology Procurement Framework Agreement ("the
    // </bbox>
    expect(doc.bboxes?.[0].innerTextSource).toEqual(
      'On 22 December 2008 ART EFFECTS LIMITED and Customer entered into an Information Technology Procurement Framework Agreement ("the '
    );
    expect(doc.bboxes?.[0].innerTextLocation).toEqual({ begin: 2530, end: 2660 });

    // <bbox height="6.672959804534912" page="51" width="110.71336364746094" x="54.0" y="298.3670349121094">&lt;Enter Amendment Text> </bbox>
    expect(doc.bboxes?.[1490].innerTextSource).toEqual('&lt;Enter Amendment Text> ');
    expect(doc.bboxes?.[1490].innerTextLocation).toEqual({ begin: 442990, end: 443016 });
  });
});
