export interface TextMappings {
  pages: Page[];
  text_mappings: Cell[];
}

// [ left, top, right, bottom ]
export type Bbox = [number, number, number, number];

/** [ start (inclusive), end (exclusive) ] */
export type TextSpan = [number, number];

export type Origin = 'TopLeft' | 'BottomLeft';

export interface Page {
  page_number: number;
  width: number;
  height: number;
  origin: Origin;
}

export interface PageWithCells extends Page {
  cells: StyledCell[];
}

export interface Cell {
  page: CellPage;
  field: CellField;
}

export interface CellPage {
  page_number: number;
  bbox: Bbox;
}

export interface CellField {
  name: string;
  index: number;
  span: TextSpan;
}

export interface StyledCell extends CellPage {
  id: string;
  className?: string;
  content: string;
}
