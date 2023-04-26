import transformEnrichment from '../transformEnrichment';
import contractData from 'components/CIDocument/components/CIDocument/__fixtures__/contract.json';
import invoiceData from 'components/CIDocument/components/CIDocument/__fixtures__/invoice-index_op.json';
import purchaseOrderData from 'components/CIDocument/components/CIDocument/__fixtures__/po-index_op.json';
import { EnrichedHtmlPurchaseOrder } from 'components/CIDocument/types';
import { Contract } from 'components/CIDocument/types';
import {
  EnrichedHtml,
  EnrichedHtmlContract,
  EnrichedHtmlInvoice,
  Invoice
} from 'components/CIDocument/types';

describe('transformEnrichment - contracts', () => {
  let transformedDoc: EnrichedHtml[];
  const enriched_html = contractData.enriched_html as unknown as EnrichedHtmlContract[];

  beforeAll(() => {
    // trasnform doc for use in tests
    transformedDoc = transformEnrichment(enriched_html);
  });

  it('takes an array, and returns an array', () => {
    expect(Array.isArray(enriched_html)).toBeTruthy();
    expect(Array.isArray(transformedDoc)).toBeTruthy();
  });

  it('adds metadata to contracts', () => {
    expect((transformedDoc[0] as EnrichedHtmlContract).contract.metadata).toHaveLength(2);
    expect((transformedDoc[0] as EnrichedHtmlContract).contract.metadata?.[0].metadataType).toEqual(
      'effective_dates'
    );
  });

  it('does not add attributes and relations to contracts', () => {
    expect(
      ((transformedDoc[0] as EnrichedHtmlContract).contract as unknown as Invoice).attributes
    ).toBeUndefined();
    expect(
      ((transformedDoc[0] as EnrichedHtmlContract).contract as unknown as Invoice).relations
    ).toBeUndefined();
  });
});

describe('transformEnrichment - Invoice', () => {
  let transformedDoc: EnrichedHtml[];
  const enriched_html = invoiceData.enriched_html as unknown as EnrichedHtmlInvoice[];

  beforeAll(() => {
    // parse doc for use in tests
    transformedDoc = transformEnrichment(enriched_html);
  });

  it('adds attributes and relations to invoices', () => {
    expect((transformedDoc[0] as EnrichedHtmlInvoice).invoice.attributes).toHaveLength(5);
    expect((transformedDoc[0] as EnrichedHtmlInvoice).invoice.attributes[0]).toEqual({
      type: 'suppliers',
      text: 'INVOICE BNP Paribas S.A.',
      location: { end: 8831, begin: 8807 }
    });
    expect((transformedDoc[0] as EnrichedHtmlInvoice).invoice.relations).toHaveLength(6);
  });

  it('does not add metadata to invoices', () => {
    expect(
      ((transformedDoc[0] as EnrichedHtmlInvoice).invoice as unknown as Contract).metadata
    ).toBeUndefined();
  });
});

describe('transformEnrichment - Purchase orders', () => {
  let transformedDoc: EnrichedHtml[];
  const enriched_html = purchaseOrderData.enriched_html as unknown as EnrichedHtmlPurchaseOrder[];

  beforeAll(() => {
    // parse doc for use in tests
    transformedDoc = transformEnrichment(enriched_html);
  });

  it('adds attributes and relations to purchase order data', () => {
    expect(
      ((transformedDoc[0] as EnrichedHtmlPurchaseOrder).purchase_order as unknown as Invoice)
        .attributes
    ).toHaveLength(5);
    expect(
      ((transformedDoc[0] as EnrichedHtmlPurchaseOrder).purchase_order as unknown as Invoice)
        .attributes[0]
    ).toEqual({
      type: 'purchase_order_numbers',
      text: '4620257561',
      location: { end: 8319, begin: 8309 }
    });
    expect(
      ((transformedDoc[0] as EnrichedHtmlPurchaseOrder).purchase_order as unknown as Invoice)
        .relations
    ).toHaveLength(5);
  });

  it('does not add metadata to purchase orders', () => {
    expect(
      ((transformedDoc[0] as EnrichedHtmlPurchaseOrder).purchase_order as unknown as Contract)
        .metadata
    ).toBeUndefined();
  });
});
