import * as React from 'react';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import { SearchContext } from '../DiscoverySearch/DiscoverySearch';
import { configurationToAggregation } from '../../utils/configurationToAggregation';
import { Checkbox as CarbonCheckbox } from 'carbon-components-react';
import get from 'lodash.get';

// TODO: Figure out why Term isn't inheriting from QueryAggregation
export interface QueryTermAggregation extends DiscoveryV1.QueryAggregation, DiscoveryV1.Term {}

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
    onLoadAggregationResults,
    onUpdateAggregationQuery,
    aggregationResults: { aggregations }
  } = searchContext;

  const aggregationQuery = configurationToAggregation(configuration);
  React.useEffect(() => {
    onUpdateAggregationQuery(aggregationQuery);
    onLoadAggregationResults();
  }, []);

  const emptyAggregations = (
    <div>
      <p>There are no aggregation results.</p>
    </div>
  );

  if (aggregations) {
    return (
      <div>
        {aggregations
          .filter(aggregation => {
            return aggregation.results;
          })
          .map((aggregation: QueryTermAggregation, i: number) => {
            const aggregationResults: DiscoveryV1.AggregationResult[] = get(
              aggregation,
              'results',
              []
            );
            const aggregationField = aggregation.field;

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
          })}
      </div>
    );
  }

  return emptyAggregations;
};
