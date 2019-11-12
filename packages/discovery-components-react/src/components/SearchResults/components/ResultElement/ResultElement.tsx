import React from 'react';
import { SelectedResult } from '../../../DiscoverySearch/DiscoverySearch';
import { Button, Tile } from 'carbon-components-react';
import Launch from '@carbon/icons-react/lib/launch/16.js';
import TableSplit from '@carbon/icons-react/lib/table--split/16.js';
import {
  searchResultContentWrapperBodyClass,
  searchResultContentWrapperBodyButtonClass,
  searchResultContentWrapperBodyPassageHighlightsClass
} from '../../cssClasses';

interface ResultElementProps {
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
   * specifies whether to show tables only results or regular search results
   * TODO: This won't need to be passed through once tables are linked to documents and selecting the result works
   */
  showTablesOnlyResults?: boolean;
}

export const ResultElement: React.FunctionComponent<ResultElementProps> = ({
  body,
  buttonText = 'View result',
  element = null,
  elementType = null,
  handleSelectResult,
  passageHighlightsClassName,
  showTablesOnlyResults
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

  return (
    <Tile>
      <div
        className={elementBodyClassNames.join(' ')}
        dangerouslySetInnerHTML={{ __html: body }}
        data-testid={`search-result-element-body-${elementType}`}
      />
      {/* TODO: This check can go away once documents are linked to tables only results */}
      {!showTablesOnlyResults && (
        <Button
          className={searchResultContentWrapperBodyButtonClass}
          onClick={handleSelectResult(element, elementType)}
          kind="ghost"
          renderIcon={icon}
        >
          <span>{buttonText}</span>
        </Button>
      )}
    </Tile>
  );
};
