const purchaseOrderOntology = {
  enrichment: 'purchase_order',
  attributes: [
    'buyers',
    'purchase_order_numbers',
    'purchase_order_dates',
    'due_dates',
    'payment_terms',
    'currencies',
    'suppliers',
    'supplier_ids',
    'bill_to',
    'ship_to',
    'invoice_to',
    'total_amounts',
    'item_description',
    'quantity_ordered',
    'unit_price'
  ],
  relations: ['line_items']
};

export default purchaseOrderOntology;
