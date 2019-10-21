import React, { useContext } from 'react';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import get from 'lodash/get';
import isEqual from 'lodash.isequal';
import { settings } from 'carbon-components';
import Document16 from '@carbon/icons-react/lib/document/16.js';
import { SearchContext } from '../DiscoverySearch/DiscoverySearch';
import mustache from 'mustache';

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
   * specify a label to display instead of 'Collection Name:' on each search Result
   */
  collectionLabel: string;
  /**
   * collection name to render
   */
  collectionName: string;
}
export const Result: React.FunctionComponent<ResultProps> = ({
  result,
  resultTitleField,
  resultLinkField,
  resultLinkTemplate,
  bodyField,
  usePassages,
  passageHighlightsClassName,
  collectionLabel,
  collectionName
}) => {
  const { document_id: documentId } = result;
  const { onSelectResult, selectedResult } = useContext(SearchContext);
  const title: string | undefined = get(result, resultTitleField);
  const filename: string | undefined = get(result, 'extracted_metadata.filename');
  const firstPassageText: string | undefined = get(result, 'document_passages[0].passage_text');
  const documentRetrievalSource: string | undefined = get(
    result,
    'result_metadata.document_retrieval_source'
  );

  let body: string | undefined;
  if (usePassages) {
    body = firstPassageText || get(result, bodyField);
  } else {
    body = get(result, bodyField);
  }

  const baseStyle = `${settings.prefix}--search-result`;
  const footerStyle = `${baseStyle}__footer`;
  const collectionNameStyle = `${baseStyle}__collection-name`;
  const searchResultClasses = [baseStyle];
  if (documentRetrievalSource === 'curation') {
    searchResultClasses.push(`${baseStyle}_curation`);
  }
  if (isEqual(result, selectedResult)) {
    searchResultClasses.push(`${baseStyle}--selected`);
  }
  const titleStyle = `${baseStyle}__title`;
  const bodyStyle = `${baseStyle}__body`;
  const highlightsStyle: string = passageHighlightsClassName
    ? `${passageHighlightsClassName}`
    : `${baseStyle}--body__highlights`;

  const handleSelectResult = (): void => {
    if (resultLinkField || resultLinkTemplate) {
      // expected behavior, use the resultLinkField if it exists over the resultLinkTemplate
      const url = resultLinkField
        ? get(result, resultLinkField)
        : mustache.render(resultLinkTemplate as string, result);
      window.open(url);
    } else {
      onSelectResult(result);
    }
  };

  return (
    <div onClick={handleSelectResult} className={searchResultClasses.join(' ')}>
      {body && (
        <div
          className={`${bodyStyle} ${highlightsStyle}`}
          dangerouslySetInnerHTML={{ __html: body }}
        ></div>
      )}
      <div className={footerStyle}>
        <div className={titleStyle}>
          <div>
            <Document16 />
          </div>
          {title || filename ? <>{title ? title : filename}</> : <>{documentId}</>}
        </div>
        <div className={collectionNameStyle}>
          {collectionLabel} {collectionName}
        </div>
      </div>
    </div>
  );
};
