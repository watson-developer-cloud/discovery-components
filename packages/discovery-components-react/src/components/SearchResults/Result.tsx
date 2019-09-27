import React, { useContext } from 'react';
import DiscoveryV1 from 'ibm-watson/discovery/v1';
import get from 'lodash.get';
import { Button as CarbonButton } from 'carbon-components-react';
import { SearchContext } from '../DiscoverySearch/DiscoverySearch';

interface ResultProps {
  result: DiscoveryV1.QueryResult;
}
export const Result: React.FunctionComponent<ResultProps> = ({ result }) => {
  const { document_id: documentId } = result;
  const { onSelectResult } = useContext(SearchContext);
  const title: string | undefined = get(result, 'extracted_metadata.title');
  const filename: string | undefined = get(result, 'extracted_metadata.filename');
  return (
    <div>
      {title || filename ? (
        <>
          <h3>{title ? title : documentId}</h3>
          <h4>{filename ? filename : documentId}</h4>
        </>
      ) : (
        <h2>{documentId}</h2>
      )}
      <CarbonButton
        onClick={(): void => {
          onSelectResult(result);
        }}
      >
        preview
      </CarbonButton>
    </div>
  );
};
