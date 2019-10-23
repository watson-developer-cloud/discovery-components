import React, { SFC, useEffect } from 'react';
import get from 'lodash/get';
import { QueryResultPassage, QueryResult } from '@disco-widgets/ibm-watson/discovery/v1';
import { usePassage } from './passages';

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
   * Passage descriptor, to be highlighted
   */
  passage?: QueryResultPassage;

  /**
   * Classname for highlight <rect>
   */
  highlightClassname?: string;

  /**
   * Callback to set first page of found passage
   */
  setPassageFirstPage?: (page: number) => void;
}

// default PDF dimensions
const DEFAULT_WIDTH = 612;
const DEFAULT_HEIGHT = 792;
const DEFAULT_ORIGIN = 'BottomLeft';

// padding to enlarge highlight box
const PADDING = 5;

export const PassageHighlight: SFC<Props> = ({
  document,
  currentPage,
  passage,
  highlightClassname,
  setPassageFirstPage
}) => {
  const pageInfo = usePassage(document, passage);
  useEffect(() => {
    if (pageInfo && setPassageFirstPage) {
      setPassageFirstPage(pageInfo[0].page_number);
    }
  }, [pageInfo, setPassageFirstPage]);

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

  return (
    bboxes && (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        height="100%"
      >
        {bboxes.map(([left, top, right, bottom]) => (
          <rect
            key={`${left}${top}${right}${bottom}`}
            className={highlightClassname}
            x={left - PADDING}
            y={(origin === 'TopLeft' ? top : height - top) - PADDING}
            width={right - left + PADDING}
            height={bottom - top + PADDING}
            data-testid="highlight"
          />
        ))}
      </svg>
    )
  );
};

export default PassageHighlight;
