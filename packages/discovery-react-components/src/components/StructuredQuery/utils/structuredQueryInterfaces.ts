export interface Row {
  id: number;
}

export interface Group {
  id?: number;
  rows?: Row[];
}

export interface StructuredQuerySelection {
  id: number;
  rows: Row[];
  groups: Group[];
}
