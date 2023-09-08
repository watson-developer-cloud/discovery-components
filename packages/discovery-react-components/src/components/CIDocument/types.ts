export interface Metadata {
  metadataType: string;
  data: MetadataData[];
}

export interface MetadataData extends Item {
  text: string;
  text_normalized: string;
  confidence_level: 'High' | 'Medium' | 'Low';
  metadataType?: string;
}

export interface Location {
  begin: number;
  end: number;
}

// TODO better name
export interface Item {
  id?: string;
  location: Location;
}

export interface RelationItem extends Item {
  allAttributeIds: string[];
}

export interface Enrichment {
  __type: string;
  location: Location;
  value?: string;
}

export interface SectionType {
  html: string;
  location: Location;
  enrichments?: Enrichment[];
}

export interface Field {
  type: string | undefined;
  id: string | undefined;
}

export interface ItemMap {
  byItem: any;
  bySection: any;
}

export type EnrichedHtml = EnrichedHtmlContract | EnrichedHtmlInvoice | EnrichedHtmlPurchaseOrder;

export interface EnrichedHtmlContract {
  contract: Contract;
}
export interface EnrichedHtmlInvoice {
  invoice: Invoice;
}
export interface EnrichedHtmlPurchaseOrder {
  purchase_order: PurchaseOrder;
}

export interface EnrichedDocument {
  html: string;
  enriched_html: EnrichedHtml[];
}

export interface Contract {
  elements: [];
  payment_terms?: MetadataData[];
  contract_terms?: MetadataData[];
  contract_types?: MetadataData[];
  termination_dates?: MetadataData[];
  effective_dates?: MetadataData[];
  contract_amounts?: MetadataData[];
  metadata?: Metadata[];
  parties: [];
}

export interface Invoice {
  attributes: Attributes[];
  relations: Relations[];
}

export interface PurchaseOrder {
  attributes: Attributes[];
  relations: Relations[];
}

export interface Attributes {
  type?: string;
  text?: string;
  location: Location;
}

export interface Relations {
  type: string;
  allAttributeIds?: string[];
  attributes: Attributes[];
  relations?: Relations[];
}

export type HighlightIdsByColor = { color: string; highlightLocationIds: string[] }[];

export type HighlightFacetMentions = {
  id: string; // ${begin}_${end}
  field: string;
  fieldIndex: number;
  location: Location;
  className?: string;
};

export type HighlightWithMeta = {
  facetIds: string[];
  mentions: HighlightFacetMentions[];
  begin: number;
  end: number;
  color: string;
};
