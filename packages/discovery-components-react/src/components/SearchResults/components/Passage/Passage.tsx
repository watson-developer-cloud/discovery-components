import React from 'react';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import Launch from '@carbon/icons-react/lib/launch/16.js';
import { ResultElement, SharedElementProps } from '../ResultElement/ResultElement';

interface PassageProps extends SharedElementProps {
  /**
   * specify a className for styling <em> tags within passages
   */
  passageHighlightsClassName?: string;
  /**
   * If there is a passage,
   */
  passage?: DiscoveryV1.QueryResultPassage | undefined;
  /**
   * Override the default button text for viewing displayed text (either a passage or a defined body field) in the document
   */
  displayedTextInDocumentButtonText: string;
  /**
   * specify whether or not the Result component should display passages
   */
  usePassages: boolean;
}

export const Passage: React.FunctionComponent<PassageProps> = ({
  body,
  bodyClassName,
  handleSelectResult,
  passageHighlightsClassName,
  passage,
  displayedTextInDocumentButtonText,
  usePassages
}) => {
  const elementBodyClassNames = [bodyClassName, `${bodyClassName}--passage`];
  const highlightsClassName: string = passageHighlightsClassName
    ? `${passageHighlightsClassName}`
    : `${bodyClassName}__highlights`;
  elementBodyClassNames.push(highlightsClassName);
  const element = usePassages && passage ? passage : null;
  const elementType = usePassages && element ? 'passage' : null;

  return (
    <ResultElement
      body={body}
      bodyClassName={bodyClassName}
      elementBodyClassNames={elementBodyClassNames}
      handleSelectResult={handleSelectResult}
      element={element}
      elementType={elementType}
      buttonText={displayedTextInDocumentButtonText}
      icon={Launch}
    />
  );
};
