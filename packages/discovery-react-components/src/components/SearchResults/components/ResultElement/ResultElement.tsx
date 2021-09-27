import React, { useLayoutEffect } from 'react';
import { SelectedResult } from 'components/DiscoverySearch/DiscoverySearch';
import { Button, Tile } from 'carbon-components-react';
import { Launch16 } from '@carbon/icons-react';
import { TableSplit16 } from '@carbon/icons-react';
import DOMPurify from 'dompurify';
import {
  searchResultContentWrapperBodyClass,
  searchResultContentWrapperBodyButtonClass,
  searchResultContentWrapperBodyPassageHighlightsClass
} from 'components/SearchResults/cssClasses';

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
   * specify a className for styling passage text and highlights
   */
  passageTextClassName?: string;
  /**
   * specifies whether or not there is a Queryresult object corresponding with this ResultElement
   */
  hasResult: boolean;
  /**
   * specifies whether to use dangerouslySetInnerHtml when rendering this result element
   */
  dangerouslyRenderHtml?: boolean;
  /**
   * label used to describe the element
   */
  elementLabel?: string;
}

export const ResultElement: React.FunctionComponent<ResultElementProps> = ({
  body,
  buttonText = 'View document',
  element = null,
  elementType = null,
  elementLabel,
  handleSelectResult,
  passageTextClassName,
  hasResult,
  dangerouslyRenderHtml
}) => {
  const elementBodyClassNames: string[] = [searchResultContentWrapperBodyClass];
  if (elementType) {
    elementBodyClassNames.push(`${searchResultContentWrapperBodyClass}--${elementType}`);
  }
  if (elementType === 'passage') {
    passageTextClassName
      ? elementBodyClassNames.push(passageTextClassName)
      : elementBodyClassNames.push(searchResultContentWrapperBodyPassageHighlightsClass);
  }
  const icon = elementType === 'table' ? TableSplit16 : Launch16;

  const elementBodyProps = {
    className: elementBodyClassNames.join(' '),
    'data-testid': `search-result-element-body-${elementType}`,
    'aria-label': elementLabel,
    // Tables must be wrapped in an element that has role of article to ensure screen readers
    // understand that the table is not semantically correct.
    ...(elementType === 'table' ? { role: 'article' } : {})
  };

  useLayoutEffect(() => {
    if (elementType === 'table') {
      DOMPurify.addHook('afterSanitizeAttributes', function (node) {
        if (node.tagName === 'TABLE') {
          node.setAttribute('role', 'presentation');
        }
      });
    }

    return () => {
      if (elementType === 'table') {
        DOMPurify.removeHook('afterSanitizeAttributes');
      }
    };
  }, [elementType]);

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
