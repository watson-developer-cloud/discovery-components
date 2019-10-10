import React, { useContext } from 'react';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import get from 'lodash.get';
import isEqual from 'lodash.isequal';
import { settings } from 'carbon-components';
import { SearchContext } from '../DiscoverySearch/DiscoverySearch';
import mustache from 'mustache';

interface ResultProps {
  result: DiscoveryV1.QueryResult;
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
}
export const Result: React.FunctionComponent<ResultProps> = ({
  result,
  resultLinkField,
  resultLinkTemplate,
  bodyField
}) => {
  const { document_id: documentId } = result;
  const { onSelectResult, selectedResult } = useContext(SearchContext);
  const title: string | undefined = get(result, 'extracted_metadata.title');
  const filename: string | undefined = get(result, 'extracted_metadata.filename');
  const body: string | undefined = get(result, bodyField);
  const baseStyle = `${settings.prefix}--search-result`;
  const selectedStyle: string = isEqual(result, selectedResult) ? `${baseStyle}--selected` : '';

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
    <div onClick={handleSelectResult} className={`${baseStyle} ${selectedStyle}`}>
      {title || filename ? (
        <>
          <h3>{title ? title : documentId}</h3>
          <h4>{filename ? filename : documentId}</h4>
        </>
      ) : (
        <h2>{documentId}</h2>
      )}
      {body && <div dangerouslySetInnerHTML={{ __html: body }}></div>}
    </div>
  );
};
