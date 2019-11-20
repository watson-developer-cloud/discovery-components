import React from 'react';
import { SelectedResult } from '../../../DiscoverySearch/DiscoverySearch';
import { Button, Tile } from 'carbon-components-react';
import Launch from '@carbon/icons-react/lib/launch/16';
import TableSplit from '@carbon/icons-react/lib/table--split/16';
import DOMPurify from 'dompurify';
import {
  searchResultContentWrapperBodyClass,
  searchResultContentWrapperBodyButtonClass,
  searchResultContentWrapperBodyPassageHighlightsClass
} from '../../cssClasses';

export interface ResultElementProps {
  /**
   * body of the result element. Table html if a table element. Otherwise, first passage text or bodyField.
   */
  body: string;
  /**
   * CTA text for viewing the result element in the document
   */
  buttonText?: string;
  /**
   * the result element object
   */
  element?: SelectedResult['element'];
  /**
   * type of result element
   */
  elementType?: SelectedResult['elementType'];
  /**
   * handler for selecting the result element to view in the document
   */
  handleSelectResult: (
    element: SelectedResult['element'],
    elementType: SelectedResult['elementType']
  ) => (event: React.MouseEvent<HTMLButtonElement>) => void;
  /**
   * specifies a className for styling <em> tags within passages
   */
  passageHighlightsClassName?: string;
  /**
   * specifies whether or not there is a Queryresult object corresponding with this ResultElement
   */
  hasResult: boolean;
  /**
   * specifies whether to use dangerouslySetInnerHtml when rendering this result element
   */
  dangerouslyRenderHtml?: boolean;
}

export const ResultElement: React.FunctionComponent<ResultElementProps> = ({
  body,
  buttonText = 'View document',
  element = null,
  elementType = null,
  handleSelectResult,
  passageHighlightsClassName,
  hasResult,
  dangerouslyRenderHtml
}) => {
  const elementBodyClassNames: string[] = [searchResultContentWrapperBodyClass];
  if (elementType) {
    elementBodyClassNames.push(`${searchResultContentWrapperBodyClass}--${elementType}`);
  }
  if (elementType === 'passage') {
    passageHighlightsClassName
      ? elementBodyClassNames.push(passageHighlightsClassName)
      : elementBodyClassNames.push(searchResultContentWrapperBodyPassageHighlightsClass);
  }
  const icon = elementType === 'table' ? TableSplit : Launch;

  const elementBodyProps = {
    className: elementBodyClassNames.join(' '),
    'data-testid': `search-result-element-body-${elementType}`
  };

  return (
    <Tile>
      {dangerouslyRenderHtml ? (
        <div {...elementBodyProps} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body) }} />
      ) : (
        <div {...elementBodyProps}>{body}</div>
      )}
      <Button
        className={searchResultContentWrapperBodyButtonClass}
        onClick={handleSelectResult(element, elementType)}
        kind="ghost"
        renderIcon={icon}
        disabled={!hasResult}
        data-testid={'search-result-element-preview-button'}
      >
        <span>{buttonText}</span>
      </Button>
    </Tile>
  );
};
