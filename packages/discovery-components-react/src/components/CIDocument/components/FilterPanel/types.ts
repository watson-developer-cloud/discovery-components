export interface Filter {
  [key: string]: string[];
}

export interface FilterOption {
  displayName: string;
  id: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  title: string;
  optionsList?: FilterOption[];
  type: 'checkbox' | 'radio';
}

export interface FilterChangeArgs {
  optionId: string;
  groupId: string;
  type: string;
  checked?: boolean;
}
