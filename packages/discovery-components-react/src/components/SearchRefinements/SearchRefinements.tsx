import * as React from 'react';
import DiscoveryV1 from 'ibm-watson/discovery/v1';
import { SearchContext } from '../DiscoverySearch/DiscoverySearch';
import { QueryTermAggregation } from '../../utils/queryTermAggregation';
import { configurationToAggregation } from '../../utils/configurationToAggregation';
import { Checkbox as CarbonCheckbox } from 'carbon-components-react';

interface SearchRefinementsProps {
  /**
   * Refinements configuration with fields and results counts
   */
  configuration: Array<QueryTermAggregation>;
}

export const SearchRefinements: React.FunctionComponent<SearchRefinementsProps> = ({
  configuration
}) => {
  const searchContext = React.useContext(SearchContext);
  const {
    onUpdateAggregationQuery,
    onSearch,
    searchResults: { aggregations }
  } = searchContext;

  const aggregationQuery = configurationToAggregation(configuration);
  React.useEffect(() => {
    onUpdateAggregationQuery(aggregationQuery);
    onSearch();
  }, []);

  const emptyAggregations = (
    <div>
      <p>There are no aggregation results.</p>
    </div>
  );

  if (aggregations) {
    return (
      <div>
        {aggregations.map((aggregation: QueryTermAggregation, i: number) => {
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
        })}
      </div>
    );
  }

  return emptyAggregations;
};
