import { EnrichedHtml } from '../types';
declare const ENRICHMENTS: {
    CONTRACT: string;
    INVOICE: string;
    PURCHASE_ORDER: string;
};
declare function getEnrichmentName(enrichedHtml: EnrichedHtml): string;
export { ENRICHMENTS, getEnrichmentName };
