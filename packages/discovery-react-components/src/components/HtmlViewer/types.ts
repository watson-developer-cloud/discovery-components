import { QueryResultPassage, QueryTableResult } from 'ibm-watson/discovery/v2';

export interface DocumentData {
  styles?: string[];
  sections?: any[];
  itemMap?: {
    byItem: any;
    bySection: any;
  };
}

export interface Options {
  sections?: boolean;
  tables?: boolean;
  bbox?: boolean;
  itemMap?: boolean;
  field?: string;
  highlight?: QueryResultPassage | QueryTableResult;
  enrichmentFields?: EnrichmentField[];
}

export interface EnrichmentField {
  path: string;
  locationData: string;
  filter: (items: string[]) => string[];
}

export interface Section {
  html: string;
  location: {
    begin: number;
    end: number;
  };
  enrichments: any[];
}

export interface Location {
  begin: number;
  end: number;
}

export interface ProcessedDoc {
  styles: string[];
  sections?: any[];
  tables?: Table[];
  bboxes?: ProcessedBbox[];
  itemMap?: {
    byItem: any;
    bySection: any;
  };
}

export interface ProcessedBbox {
  left: number;
  right: number;
  top: number;
  bottom: number;
  page: number;
  className: string;
  location: Location;
}

export interface Table {
  location: Location;
  bboxes: ProcessedBbox[];
}
