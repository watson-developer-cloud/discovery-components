import { EnrichedHtml } from '../types';

const ENRICHMENTS = {
  CONTRACT: 'contract',
  INVOICE: 'invoice',
  PURCHASE_ORDER: 'purchase_order'
};

function getEnrichmentName(enrichedHtml: EnrichedHtml): string {
  if (enrichedHtml) {
    if (ENRICHMENTS.INVOICE in enrichedHtml) {
      return ENRICHMENTS.INVOICE;
    } else if (ENRICHMENTS.PURCHASE_ORDER in enrichedHtml) {
      return ENRICHMENTS.PURCHASE_ORDER;
    }
  }
  return ENRICHMENTS.CONTRACT;
}

export { ENRICHMENTS, getEnrichmentName };
