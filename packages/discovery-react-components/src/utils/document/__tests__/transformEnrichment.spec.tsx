import transformEnrichment from '../transformEnrichment';
import isEqual from 'lodash/isEqual';
import contractData from 'components/CIDocument/components/CIDocument/__fixtures__/contract.json';
import invoiceData from 'components/CIDocument/components/CIDocument/__fixtures__/invoice-index_op.json';
import purchaseOrderData from 'components/CIDocument/components/CIDocument/__fixtures__/po-index_op.json';
import { EnrichedHtml } from 'components/CIDocument/types';

describe('transformEnrichment - contracts', () => {
  let transformedDoc: EnrichedHtml[];
  const enriched_html = contractData.enriched_html;

  beforeAll(() => {
    // trasnform doc for use in tests
    transformedDoc = transformEnrichment(enriched_html);
  });

  it('takes an array, and returns an array', () => {
    expect(Array.isArray(enriched_html)).toBeTruthy();
    expect(Array.isArray(transformedDoc)).toBeTruthy();
  });

  it('adds metadata to contracts', () => {
    expect(isEqual(enriched_html, transformedDoc)).toBeFalsy();
    expect(transformedDoc[0].contract.metadata).toHaveLength(2);
    expect(transformedDoc[0].contract.metadata[0].metadataType).toEqual('effective_dates');
  });

  it('does not add attributes and relations to contracts', () => {
    expect(transformedDoc[0].contract.attributes).toBeUndefined();
    expect(transformedDoc[0].contract.relations).toBeUndefined();
  });
});

describe('transformEnrichment - Invoice', () => {
  let transformedDoc: EnrichedHtml[];
  const enriched_html = invoiceData.enriched_html;

  beforeAll(() => {
    // parse doc for use in tests
    transformedDoc = transformEnrichment(enriched_html);
  });

  it('adds attributes and relations to invoices', () => {
    expect(isEqual(enriched_html, transformedDoc)).toBeFalsy();
    expect(transformedDoc[0].invoice.attributes).toHaveLength(5);
    expect(transformedDoc[0].invoice.attributes[0]).toEqual({
      type: 'suppliers',
      text: 'INVOICE BNP Paribas S.A.',
      location: { end: 8831, begin: 8807 }
    });
    expect(transformedDoc[0].invoice.relations).toHaveLength(6);
  });

  it('does not add metadata to invoices', () => {
    expect(transformedDoc[0].invoice.metadata).toBeUndefined();
  });
});

describe('transformEnrichment - Purchase orders', () => {
  let transformedDoc: EnrichedHtml[];
  const enriched_html = purchaseOrderData.enriched_html;

  beforeAll(() => {
    // parse doc for use in tests
    transformedDoc = transformEnrichment(enriched_html);
  });

  it('adds attributes and relations to purchase order data', () => {
    expect(isEqual(enriched_html, transformedDoc)).toBeFalsy();
    expect(transformedDoc[0].purchase_order.attributes).toHaveLength(5);
    expect(transformedDoc[0].purchase_order.attributes[0]).toEqual({
      type: 'purchase_order_numbers',
      text: '4620257561',
      location: { end: 8319, begin: 8309 }
    });
    expect(transformedDoc[0].purchase_order.relations).toHaveLength(5);
  });

  it('does not add metadata to purchase orders', () => {
    expect(transformedDoc[0].purchase_order.metadata).toBeUndefined();
  });
});
