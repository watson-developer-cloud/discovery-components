export interface Row {
  [key: number]: {
    field: string;
    operator: '::' | '::!' | ':' | ':!' | '';
    value: string;
  };
}

export interface Group {
  [key: number]: {
    rows: number[];
    operator: ',' | '|' | '';
  };
}

export interface StructuredQuerySelection {
  groups: Group;
  group_order: number[];
  rows: Row;
}

export interface FieldDropdownSelectedItem {
  selectedItem: string;
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
