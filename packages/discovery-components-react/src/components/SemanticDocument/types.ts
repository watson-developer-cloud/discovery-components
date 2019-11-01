export interface Location {
  begin: number;
  end: number;
}

// TODO better name
export interface Item {
  id?: string;
  location: Location;
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
