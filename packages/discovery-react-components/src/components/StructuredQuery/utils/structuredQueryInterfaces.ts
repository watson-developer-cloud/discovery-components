export interface Row {
  rows: number[];
}

export interface Group {
  [key: number]: Row;
}

export interface StructuredQuerySelection {
  groups: Group;
  group_order: number[];
}
