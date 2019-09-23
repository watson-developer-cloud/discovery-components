import * as React from 'react';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import { Checkbox as CarbonCheckbox } from 'carbon-components-react';

interface SearchRefinementsProps {
  /** Query response that contains aggregation results for the query */
  /** TODO: This issue should go away when we hook up to the search context, but otherwise should determine why we
   * need to specify DiscoveryV1.QueryResult here and if this best represents the type.
   */
  queryResponse: DiscoveryV1.QueryResponse | DiscoveryV1.QueryResult;
}

interface QueryTermAggregation extends DiscoveryV1.QueryAggregation {
  field?: string;
}

export const SearchRefinements: React.SFC<SearchRefinementsProps> = ({ queryResponse }) => {
  const aggregations = queryResponse.aggregations;
  const emptyAggregations = (
    <div>
      <h1>There are no aggregation results.</h1>
    </div>
  );

  if (aggregations) {
    return aggregations.map((aggregation: QueryTermAggregation, i: number) => {
      const aggregationResults = aggregation.results;
      const aggregationField = aggregation.field;

      if (aggregationResults) {
        return (
          <fieldset className="bx--fieldset" key={`fieldset-${aggregationField}-${i}`}>
            <legend className="bx--label">{aggregationField}</legend>
            {aggregationResults.map((result: DiscoveryV1.AggregationResult, index: number) => {
              const resultKey = result.key;

              return (
                <CarbonCheckbox
                  labelText={resultKey}
                  key={`checkbox-label-${resultKey}-${index}`}
                  id={`checkbox-label-${resultKey}-${index}`}
                  defaultChecked={false}
                />
              );
            })}
          </fieldset>
        );
      } else {
        return emptyAggregations;
      }
    });
  }

  return emptyAggregations;
};
