import { FC, useEffect, ReactElement } from 'react';
import { QueryResultPassage, QueryResult } from '@disco-widgets/ibm-watson/discovery/v2';
import get from 'lodash/get';
import { usePassage } from './passages';
import { DEFAULT_WIDTH, DEFAULT_HEIGHT, DEFAULT_ORIGIN } from './constants';

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
  highlight: QueryResultPassage;

  /**
   * Callback to set first page of found highlight
   */
  setHighlightFirstPage?: (page: number) => void;

  children: (props: any) => ReactElement;
}

export const PassageHighlight: FC<Props> = ({
  document,
  currentPage,
  highlight,
  setHighlightFirstPage,
  children
}) => {
  const pageInfo = usePassage(document, highlight);
  useEffect(() => {
    if (pageInfo && setHighlightFirstPage) {
      setHighlightFirstPage(pageInfo[0].page_number);
    }
  }, [pageInfo, setHighlightFirstPage]);

  let bboxes = null;
  if (pageInfo && currentPage > 0) {
    bboxes = pageInfo.filter(page => page.page_number === currentPage).map(page => page.bbox);
  }

  // get page info
  let width = DEFAULT_WIDTH;
  let height = DEFAULT_HEIGHT;
  let origin = DEFAULT_ORIGIN;
  const pages = get(document, 'extracted_metadata.text_mappings.pages');
  if (pages && pages[currentPage - 1]) {
    const page = pages[currentPage - 1];
    ({ width, height, origin } = page);
  }

  return bboxes ? children({ bboxes, origin, pageWidth: width, pageHeight: height }) : null;
};

export default PassageHighlight;
