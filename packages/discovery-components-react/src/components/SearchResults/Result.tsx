import React from 'react';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import get from 'lodash.get';

interface ResultProps {
  result: DiscoveryV1.QueryResult;
}
export const Result: React.FunctionComponent<ResultProps> = ({ result }) => {
  const { document_id: documentID } = result;
  const title: string | undefined = get(result, 'extracted_metadata.title');
  const filename: string | undefined = get(result, 'extracted_metadata.filename');

  return (
    <div>
      {title || filename ? (
        <>
          <h2>{title ? title : documentID}</h2>
          <h3>{filename ? filename : documentID}</h3>
        </>
      ) : (
        <h2>{documentID}</h2>
      )}
    </div>
  );
};
