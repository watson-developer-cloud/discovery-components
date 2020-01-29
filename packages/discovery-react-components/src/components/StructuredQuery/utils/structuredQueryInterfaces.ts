export interface Row {
  [key: number]: {
    field: string | null;
    operator: string | null;
    value: string;
  };
}

export interface Group {
  [key: number]: {
    rows: number[];
    operator: string;
  };
}

export interface StructuredQuerySelection {
  groups: Group;
  group_order: number[];
  rows: Row;
}

export interface OperatorDropdownSelectedItem {
  selectedItem: {
    label: string;
    value: '::' | '::!' | ':' | ':!';
  };
}

export interface RuleGroupDropdownSelectedItem {
  selectedItem: {
    label: 'any' | 'all';
    value: ',' | '|';
  };
}
