import transformEnrichment from '../transformEnrichment';
import isEqual from 'lodash/isEqual';
import contractData from 'components/CIDocument/components/CIDocument/__fixtures__/contract.json';
import invoiceData from 'components/CIDocument/components/CIDocument/__fixtures__/invoice-index_op.json';
import purchaseOrderData from 'components/CIDocument/components/CIDocument/__fixtures__/po-index_op.json';
import { EnrichedHtml } from '../../../components/CIDocument/types';

describe('transformEnrichment', () => {
  let trasnformedDoc: EnrichedHtml[];
  const enriched_html = contractData.enriched_html;

  beforeAll(() => {
    // trasnform doc for use in tests
    trasnformedDoc = transformEnrichment(enriched_html);
  });

  it('takes an array, and returns an array', () => {
    expect(Array.isArray(enriched_html)).toBeTruthy();
    expect(Array.isArray(trasnformedDoc)).toBeTruthy();
  });

  it('adds metadata to contracts', () => {
    expect(isEqual(enriched_html, trasnformedDoc)).toBeFalsy();
    expect(trasnformedDoc[0].contract.metadata).toHaveLength(2);
    expect(trasnformedDoc[0].contract.metadata[0].metadataType).toEqual('effective_dates');
  });

  it('does not add attributes and relations to contracts', () => {
    expect(trasnformedDoc[0].contract.attributes).toBeUndefined();
    expect(trasnformedDoc[0].contract.relations).toBeUndefined();
  });
});

describe('transformEnrichment', () => {
  let trasnformedDoc: EnrichedHtml[];
  const enriched_html = invoiceData.enriched_html;

  beforeAll(() => {
    // parse doc for use in tests
    trasnformedDoc = transformEnrichment(enriched_html);
  });

  it('adds attributes and relations to invoices', () => {
    expect(isEqual(enriched_html, trasnformedDoc)).toBeFalsy();
    expect(trasnformedDoc[0].invoice.attributes).toHaveLength(5);
    expect(trasnformedDoc[0].invoice.attributes[0]).toEqual({
      type: 'suppliers',
      text: 'INVOICE BNP Paribas S.A.',
      location: { end: 8831, begin: 8807 }
    });
    expect(trasnformedDoc[0].invoice.relations).toHaveLength(6);
  });

  it('does not add metadata to invoices', () => {
    expect(trasnformedDoc[0].invoice.metadata).toBeUndefined();
  });
});

describe('transformEnrichment', () => {
  let trasnformedDoc: EnrichedHtml[];
  const enriched_html = purchaseOrderData.enriched_html;

  beforeAll(() => {
    // parse doc for use in tests
    trasnformedDoc = transformEnrichment(enriched_html);
  });

  it('adds attributes and relations to purchase order data', () => {
    expect(isEqual(enriched_html, trasnformedDoc)).toBeFalsy();
    expect(trasnformedDoc[0].purchase_order.attributes).toHaveLength(5);
    expect(trasnformedDoc[0].purchase_order.attributes[0]).toEqual({
      type: 'purchase_order_numbers',
      text: '4620257561',
      location: { end: 8319, begin: 8309 }
    });
    expect(trasnformedDoc[0].purchase_order.relations).toHaveLength(5);
  });

  it('does not add metadata to purchase orders', () => {
    expect(trasnformedDoc[0].purchase_order.metadata).toBeUndefined();
  });
});
