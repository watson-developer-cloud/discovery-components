import { FC, useEffect, useState, ReactElement } from 'react';
import get from 'lodash/get';
import { QueryResult, QueryTableResult } from '@disco-widgets/ibm-watson/discovery/v2';
import processDoc, { ProcessedDoc, Table } from '../../../../utils/document/processDoc';
import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from './constants';

interface Props {
  /**
   * Document data returned by query
   */
  document?: QueryResult | null;

  /**
   * Page to display
   */
  currentPage: number;

  /**
   * Highlight descriptor, to be highlighted
   */
  highlight: QueryTableResult;

  /**
   * Callback to set first page of found highlight
   */
  setHighlightFirstPage?: (page: number) => void;

  children: (props: any) => ReactElement;
}

export const TableHighlight: FC<Props> = ({
  document,
  currentPage,
  highlight,
  setHighlightFirstPage,
  children
}) => {
  const [processedDoc, setProcessedDoc] = useState<ProcessedDoc | null>(null);
  useEffect(() => {
    async function process(): Promise<void> {
      try {
        const doc = await processDoc(document as QueryResult, { tables: true });
        setProcessedDoc(doc);
      } catch (err) {}
    }

    if (document && document.html) {
      process();
    }
  }, [document]);

  const [matchedTable, setMatchedTable] = useState<Table | null>(null);
  useEffect(() => {
    if (!processedDoc || !processedDoc.tables) {
      return;
    }
    const loc = get(highlight, 'table.location');
    if (!loc) {
      return;
    }

    const { begin, end } = loc;
    const table = processedDoc.tables.find(
      ({ location }) => location.begin <= end && location.end >= begin
    );
    if (table) {
      setMatchedTable(table);
      if (setHighlightFirstPage) {
        setHighlightFirstPage(table.bboxes[0].page);
      }
    }
  }, [processedDoc, highlight, setHighlightFirstPage]);

  let bboxes = null;
  if (matchedTable && currentPage > 0) {
    bboxes = matchedTable.bboxes
      .filter(bbox => bbox.page === currentPage)
      .map(({ left, right, top, bottom }) => [left, top, right, bottom]);
  }

  // get page info; if available
  let width = DEFAULT_WIDTH;
  let height = DEFAULT_HEIGHT;
  // when using `html`, origin is always top-left
  let origin = 'TopLeft';
  const pages = get(document, 'extracted_metadata.text_mappings.pages');
  if (pages && pages[currentPage - 1]) {
    const page = pages[currentPage - 1];
    ({ width, height, origin } = page);
  }

  return bboxes ? children({ bboxes, origin, pageWidth: width, pageHeight: height }) : null;
};

export default TableHighlight;
