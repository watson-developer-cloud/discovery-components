export interface Row {
  [key: number]: {
    field: string;
    operator: '' | ',' | '|';
    value: string;
  };
}

export interface Group {
  [key: number]: {
    rows: number[];
  };
}

export interface StructuredQuerySelection {
  operator: ',' | '|';
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
