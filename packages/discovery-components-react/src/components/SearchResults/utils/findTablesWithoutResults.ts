import DiscoveryV2 from 'ibm-watson/discovery/v2';
import get from 'lodash/get';

export const findTablesWithoutResults = (
  tableResults: DiscoveryV2.QueryTableResult[],
  results: DiscoveryV2.QueryResult[]
): DiscoveryV2.QueryTableResult[] | null => {
  const tablesWithoutResults = tableResults.filter(table => {
    const matchingResult = results.find(result => {
      return (
        table.source_document_id === result.document_id &&
        table.collection_id === get(result, 'result_metadata.collection_id')
      );
    });
    return !matchingResult;
  });
  return tablesWithoutResults;
};
