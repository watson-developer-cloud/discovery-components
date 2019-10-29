import React from 'react';
import { SelectedResult } from '../../../DiscoverySearch/DiscoverySearch';
import { Tile } from 'carbon-components-react';
import { Button } from 'carbon-components-react';

export interface SharedElementProps {
  /**
   * Body of the result element. First passage text or bodyField if a passage element. Table html if a table element.
   */
  body: string;
  /**
   * className for body styles
   */
  bodyClassName: string;
  /**
   * Handler for selecting the passage to view in document
   */
  handleSelectResult: (
    element: SelectedResult['element'],
    elementType: SelectedResult['elementType']
  ) => (event: React.MouseEvent<HTMLButtonElement>) => void;
}

interface ResultElementProps extends SharedElementProps {
  /**
   * classNames for body styles
   */
  elementBodyClassNames: string[];
  /**
   * The result element object
   */
  element: SelectedResult['element'];
  /**
   * Type of result element
   */
  elementType: SelectedResult['elementType'];
  /**
   * CTA text to use for button
   */
  buttonText: string;
  /**
   * Icon to render in ghost button
   */
  icon: object;
}

export const ResultElement: React.FunctionComponent<ResultElementProps> = ({
  body,
  bodyClassName,
  elementBodyClassNames,
  handleSelectResult,
  element,
  elementType,
  buttonText,
  icon
}) => {
  return (
    <Tile>
      <div className={elementBodyClassNames.join(' ')} dangerouslySetInnerHTML={{ __html: body }} />
      <Button
        className={`${bodyClassName}__button`}
        onClick={handleSelectResult(element, elementType)}
        kind="ghost"
        renderIcon={icon}
      >
        <span>{buttonText}</span>
      </Button>
    </Tile>
  );
};
