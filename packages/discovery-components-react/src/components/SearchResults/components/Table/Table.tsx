import React from 'react';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import TableSplit from '@carbon/icons-react/lib/table--split/16.js';
import { ResultElement, SharedElementProps } from '../ResultElement/ResultElement';

interface TableProps extends SharedElementProps {
  /**
   * the first table result for the search result
   */
  table: DiscoveryV1.QueryTableResult;
  /**
   * Override the default button text for viewing a table in the document
   */
  tableInDocumentButtonText: string;
}

export const Table: React.FunctionComponent<TableProps> = ({
  bodyClassName,
  handleSelectResult,
  table,
  body,
  tableInDocumentButtonText
}) => {
  const elementBodyClassNames = [bodyClassName, `${bodyClassName}--table`];

  return (
    <ResultElement
      body={body}
      elementBodyClassNames={elementBodyClassNames}
      bodyClassName={bodyClassName}
      handleSelectResult={handleSelectResult}
      element={table}
      elementType="table"
      buttonText={tableInDocumentButtonText}
      icon={TableSplit}
    />
  );
};
