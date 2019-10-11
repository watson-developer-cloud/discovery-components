import React, { SFC, useEffect } from 'react';
import { QueryResultPassage } from '@disco-widgets/ibm-watson/discovery/v1';
import { usePassage } from './passages';

interface Props {
  /**
   * Document data returned by query
   */
  document?: any;

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
const WIDTH = 612;
const HEIGHT = 792;
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

  return (
    bboxes && (
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        height="100%"
      >
        {bboxes.map(([left, top, right, bottom]) => (
          <rect
            key={`${left}${top}${right}${bottom}`}
            className={highlightClassname}
            x={left - PADDING}
            y={HEIGHT - top - PADDING}
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
