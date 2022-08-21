import { TextMappings } from 'components/DocumentPreview/types';
import { TextContent } from 'pdfjs-dist/types/display/api';
import { PageViewport } from 'pdfjs-dist/types/display/display_utils';
import { ProcessedDoc } from 'utils/document';
import { Bbox, DocumentFields, TextSpan } from '../../types';

/**
 * Text layout information
 */
export interface TextLayout<CellType extends TextLayoutCell = TextLayoutCell> {
  /**
   * cells, paris of bbox and text, of this text layout
   */
  readonly cells: CellType[];

  /**
   * get cell by ID
   */
  cellAt(id: CellType['id']): CellType;
}

/**
 * Text layout cell. A text and its bbox.
 */
export interface TextLayoutCell<IDType = number> extends TextLayoutCellBase {
  readonly parent: TextLayout<TextLayoutCell>;

  /**
   * ID to identify this cell in
   */
  readonly id: IDType;

  /**
   * text of this cell
   */
  readonly text: string;

  readonly pageNum: number;
  readonly bbox: Bbox;

  /**
   * get bbox for the given text span.
   * @returns null when it's not available
   */
  getBboxForTextSpan(span: TextSpan, options?: { useRatio?: boolean }): Bbox | null;

  /**
   * a special property for PDF text content item cell. True when this cell overlaps HTML cell
   */
  readonly isInHtmlBbox?: boolean;
}

/**
 * Generic text layout cell. Bbox may not be directly available.
 * Mainly for sub-string of a text layout cell.
 */
export interface TextLayoutCellBase {
  /**
   * text of this cell
   */
  readonly text: string;

  /**
   * get sub-span of this text layout
   */
  getPartial(span: TextSpan): TextLayoutCellBase;

  /**
   * get normalized form, the base text layout cell and a span on it
   */
  getNormalized(): { cell: TextLayoutCell; span?: TextSpan };

  /**
   * get cell for the trimmed text
   */
  trim(): TextLayoutCellBase;
}

/**
 * Information to create HtmlBboxTextLayout
 */
export type HtmlBboxInfo = Pick<ProcessedDoc, 'bboxes' | 'styles'>;

/**
 * Information to create PdfTextContentTextLayout
 */
export type PdfTextContentInfo = {
  textContent: TextContent;
  viewport: PageViewport;
};

/**
 * Information to create TextMappingsTextLayout
 */
export type TextMappingInfo = {
  document: DocumentFields;
  textMappings: TextMappings;
};
