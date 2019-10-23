export interface TextMappings {
  pages: Page[];
  cells: Cell[];
}

// [ left, top, right, bottom ]
export type Bbox = [number, number, number, number];

export type Origin = 'TopLeft' | 'BottomLeft';

export interface Page {
  page_number: number;
  width: number;
  height: number;
  origin: Origin;
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
  // [ START, END ]
  span: [number, number];
}
