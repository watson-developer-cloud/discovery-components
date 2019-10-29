import React, { useContext } from 'react';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import get from 'lodash/get';
import isEqual from 'lodash.isequal';
import { settings } from 'carbon-components';
import { SearchApi, SearchContext, SelectedResult } from '../../../DiscoverySearch/DiscoverySearch';
import mustache from 'mustache';
import { Passage } from '../Passage/Passage';
import { Table } from '../Table/Table';

interface ResultProps {
  result: DiscoveryV1.QueryResult;
  /**
   * specify a field on the result object to pull the result title from
   */
  resultTitleField: string;
  /**
   * specify a field on the result object to pull the result link from
   */
  resultLinkField?: string;
  /**
   * specify a string template using mustache templating syntax https://github.com/janl/mustache.js to pull the result link from
   */
  resultLinkTemplate?: string;
  /**
   * specify a field on the result object to pull the displayed text from
   */
  bodyField: string;
  /**
   * specify whether or not the Result component should display passages
   */
  usePassages: boolean;
  /**
   * specify a className for styling <em> tags within passages
   */
  passageHighlightsClassName?: string;
  /**
   * table results for the result object
   */
  tableResults: DiscoveryV1.QueryTableResult[];
  /** specify a label to display instead of 'Collection Name:' on each search Result
   */
  collectionLabel: string;
  /**
   * collection name to render
   */
  collectionName: string;
  /**
   * Override the default button text for viewing displayed text (either a passage or a defined body field) in the document
   */
  displayedTextInDocumentButtonText: string;
  /**
   * Override the default button text for viewing a table in the document
   */
  tableInDocumentButtonText: string;
}
export const Result: React.FunctionComponent<ResultProps> = ({
  result,
  resultTitleField,
  resultLinkField,
  resultLinkTemplate,
  bodyField,
  usePassages,
  passageHighlightsClassName,
  tableResults,
  collectionLabel,
  collectionName,
  displayedTextInDocumentButtonText,
  tableInDocumentButtonText
}) => {
  const { document_id: documentId } = result;
  const { setSelectedResult } = useContext(SearchApi);
  const { selectedResult } = useContext(SearchContext);
  const title: string | undefined = get(result, resultTitleField);
  const filename: string | undefined = get(result, 'extracted_metadata.filename');
  const firstPassage: DiscoveryV1.QueryResultPassage | undefined = get(
    result,
    'document_passages[0]'
  );
  const firstPassageText: string | undefined = get(firstPassage, 'passage_text');
  const firstTableHtml: string | undefined = get(tableResults, '[0].table_html');

  const documentRetrievalSource: string | undefined = get(
    result,
    'result_metadata.document_retrieval_source'
  );

  let displayedText: string | undefined;
  if (usePassages) {
    displayedText = firstPassageText || get(result, bodyField);
  } else {
    displayedText = get(result, bodyField);
  }

  const baseClassName = `${settings.prefix}--search-result`;
  const bodyClassName = `${baseClassName}__element__body`;
  const searchResultClasses = [baseClassName];
  if (documentRetrievalSource === 'curation') {
    searchResultClasses.push(`${baseClassName}_curation`);
  }
  if (isEqual(result, selectedResult.document)) {
    searchResultClasses.push(`${baseClassName}--selected`);
  }
  const searchResultContentClassNames = [`${baseClassName}__element`];
  if (displayedText && firstTableHtml) {
    searchResultContentClassNames.push(`${baseClassName}__element--half`);
  }

  const footerClassName = `${baseClassName}__footer`;
  const titleClassName = `${baseClassName}__footer__title`;
  const collectionNameClassName = `${baseClassName}__footer__collection-name`;

  const handleSelectResult = (
    element: SelectedResult['element'],
    elementType: SelectedResult['elementType']
  ) => {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      if (resultLinkField || resultLinkTemplate) {
        // expected behavior, use the resultLinkField if it exists over the resultLinkTemplate
        const url = resultLinkField
          ? get(result, resultLinkField)
          : mustache.render(resultLinkTemplate as string, result);
        window.open(url);
      } else {
        setSelectedResult({ document: result, element, elementType });
      }
    };
  };

  return (
    <div className={searchResultClasses.join(' ')}>
      <div className={searchResultContentClassNames.join(' ')}>
        {displayedText && (
          <Passage
            body={displayedText}
            bodyClassName={bodyClassName}
            handleSelectResult={handleSelectResult}
            passageHighlightsClassName={passageHighlightsClassName}
            displayedTextInDocumentButtonText={displayedTextInDocumentButtonText}
            passage={firstPassage}
            usePassages={usePassages}
          />
        )}
        {firstTableHtml && (
          <Table
            body={firstTableHtml}
            bodyClassName={bodyClassName}
            handleSelectResult={handleSelectResult}
            table={tableResults[0]}
            tableInDocumentButtonText={tableInDocumentButtonText}
          />
        )}
      </div>
      <div className={footerClassName}>
        <div className={titleClassName}>{title || filename || documentId}</div>
        <div className={collectionNameClassName}>
          {collectionLabel} {collectionName}
        </div>
      </div>
    </div>
  );
};
