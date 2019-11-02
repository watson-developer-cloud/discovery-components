import { Metadata, MetadataData } from '../SemanticDocument/components/MetadataPane/types';

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

interface EnrichedHtmlContract {
  contract: Contract;
}
interface EnrichedHtmlInvoice {
  invoice: Invoice;
}
interface EnrichedHtmlPurchaseOrder {
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
