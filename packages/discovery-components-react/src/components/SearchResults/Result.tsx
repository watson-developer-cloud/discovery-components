import React, { useContext } from 'react';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import get from 'lodash.get';
import isEqual from 'lodash.isequal';
import { settings } from 'carbon-components';
import { SearchContext } from '../DiscoverySearch/DiscoverySearch';

interface ResultProps {
  result: DiscoveryV1.QueryResult;
}
export const Result: React.FunctionComponent<ResultProps> = ({ result }) => {
  const { document_id: documentId } = result;
  const { onSelectResult, selectedResult } = useContext(SearchContext);
  const title: string | undefined = get(result, 'extracted_metadata.title');
  const filename: string | undefined = get(result, 'extracted_metadata.filename');
  const baseStyle = `${settings.prefix}--search-result`;
  const selectedStyle: string = isEqual(result, selectedResult) ? `${baseStyle}--selected` : '';

  return (
    <div
      onClick={(): void => {
        onSelectResult(result);
      }}
      className={`${baseStyle} ${selectedStyle}`}
    >
      {title || filename ? (
        <>
          <h3>{title ? title : documentId}</h3>
          <h4>{filename ? filename : documentId}</h4>
        </>
      ) : (
        <h2>{documentId}</h2>
      )}
    </div>
  );
};
