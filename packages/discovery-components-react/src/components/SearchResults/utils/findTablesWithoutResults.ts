import DiscoveryV2 from 'ibm-watson/discovery/v2';

export const findTablesWithoutResults = (
  tableResults: DiscoveryV2.QueryTableResult[],
  results: DiscoveryV2.QueryResult[]
): DiscoveryV2.QueryTableResult[] | null => {
  const tablesWithoutResults = tableResults.filter(table => {
    const matchingResult = results.find(result => {
      table.source_document_id === result.document_id;
    });
    return !matchingResult;
  });
  return tablesWithoutResults;
};
