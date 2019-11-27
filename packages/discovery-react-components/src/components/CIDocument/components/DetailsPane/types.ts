export interface Items {
  heading: string;
  items: Item[];
}

export type Item = string | ItemLink | ItemLabel;

export interface ItemLink {
  label?: string;
  link: boolean;
  type: string;
  value?: {
    label: string;
  };
}

export interface ItemLabel {
  label: string;
}

export type OnActiveLinkChangeFn = (args: { sectionTitle: string; type: string }) => void;
