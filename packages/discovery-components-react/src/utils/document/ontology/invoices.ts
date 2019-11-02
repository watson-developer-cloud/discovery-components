const invoiceOntology = {
  enrichment: 'invoice',
  attributes: [
    'buyers',
    'suppliers',
    'currencies',
    'purchase_order_numbers',
    'invoice_numbers',
    'invoice_dates',
    'due_dates',
    'amount',
    'currency',
    'quantity_ordered',
    'part_description'
  ],
  relations: ['totals_due', 'unit_price', 'invoice_parts']
};

export default invoiceOntology;
