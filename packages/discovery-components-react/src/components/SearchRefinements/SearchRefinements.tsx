import * as React from 'react';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import get from 'lodash.get';
import findIndex from 'lodash/findIndex';
import { Checkbox as CarbonCheckbox } from 'carbon-components-react';
import { SearchContext } from '../DiscoverySearch/DiscoverySearch';
import { buildAggregationQuery } from './utils/buildAggregationQuery';
import { SearchFilterTransform } from './utils/searchFilterTransform';
import { mergeFilterRefinements } from './utils/mergeFilterRefinements';
import {
  QueryTermAggregation,
  SelectableAggregationResult
} from './utils/searchRefinementInterfaces';

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
    onRefinementsMount,
    onUpdateAggregationQuery,
    onUpdateFilter,
    onSearch,
    aggregationResults: { aggregations },
    searchParameters: { natural_language_query: naturalLanguageQuery, filter }
  } = searchContext;
  const allRefinements = mergeFilterRefinements(aggregations || [], filter || '', configuration);

  React.useEffect(() => {
    onUpdateAggregationQuery(buildAggregationQuery(configuration));
    onRefinementsMount();
  }, [configuration]);

  const emptyRefinements = (
    <div>
      <p>There are no available refinements.</p>
    </div>
  );

  const handleOnChange = (
    checked: boolean,
    _id: string,
    event: React.SyntheticEvent<HTMLInputElement>
  ): void => {
    const target: HTMLInputElement = event.currentTarget;
    const selectedRefinementField = target.getAttribute('data-field');
    const selectedRefinementKey = target.getAttribute('data-key');

    const refinementsForField = allRefinements.find(
      refinement => refinement.field === selectedRefinementField
    );
    if (refinementsForField) {
      const refinementResults: SelectableAggregationResult[] = get(
        refinementsForField,
        'results',
        []
      );
      const selectedRefinementResults: SelectableAggregationResult[] = refinementResults.map(
        result => {
          const key = get(result, 'key', '');
          return key === selectedRefinementKey
            ? Object.assign({}, result, { selected: checked })
            : result;
        }
      );
      const newrefinementsForField = Object.assign({}, refinementsForField, {
        results: selectedRefinementResults
      });
      const index = findIndex(allRefinements, refinement => {
        return refinement.field === selectedRefinementField;
      });

      allRefinements.splice(index, 1, newrefinementsForField);
    }

    onUpdateFilter(SearchFilterTransform.toString(allRefinements));
    onSearch();
  };

  if (allRefinements) {
    return (
      <div>
        {allRefinements
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
            const orderedAggregationResults = aggregationResults.sort(
              (a, b) => (b.matching_results || 0) - (a.matching_results || 0)
            );

            return (
              <fieldset className="bx--fieldset" key={`fieldset-${aggregationField}-${i}`}>
                <legend className="bx--label">{aggregationField}</legend>
                {orderedAggregationResults.map((result: DiscoveryV1.AggregationResult) => {
                  const resultKey = result.key;
                  const query = naturalLanguageQuery || '';
                  const buff = new Buffer(query + resultKey);
                  const base64data = buff.toString('base64');

                  return (
                    <CarbonCheckbox
                      onChange={handleOnChange}
                      labelText={resultKey}
                      key={`checkbox-${aggregationField}-${base64data}`}
                      id={`checkbox-${aggregationField}-${resultKey}`}
                      data-field={`${aggregationField}`}
                      data-key={`${resultKey}`}
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

  return emptyRefinements;
};
