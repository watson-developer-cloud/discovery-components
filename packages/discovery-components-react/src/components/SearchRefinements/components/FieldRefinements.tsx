import * as React from 'react';
import DiscoveryV1 from '@disco-widgets/ibm-watson/discovery/v1';
import get from 'lodash.get';
import findIndex from 'lodash/findIndex';
import { settings } from 'carbon-components';
import { Checkbox as CarbonCheckbox } from 'carbon-components-react';
import { SearchContext } from '../../DiscoverySearch/DiscoverySearch';
import { SearchFilterTransform } from '../utils/searchFilterTransform';
import {
  QueryTermAggregation,
  SelectableAggregationResult
} from '../utils/searchRefinementInterfaces';

interface FieldRefinementsProps {
  /**
   * Refinements configuration with fields and results counts
   */
  allRefinements: QueryTermAggregation[];
}

export const FieldRefinements: React.FunctionComponent<FieldRefinementsProps> = ({
  allRefinements
}) => {
  const searchContext = React.useContext(SearchContext);
  const {
    onUpdateQueryOptions,
    onSearch,
    searchParameters: { natural_language_query: naturalLanguageQuery }
  } = searchContext;

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

    onUpdateQueryOptions({
      filter: SearchFilterTransform.toString(allRefinements),
      offset: 0
    });
    onSearch();
  };

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
            <fieldset
              className={`${settings.prefix}--fieldset ${settings.prefix}--refinement`}
              key={`fieldset-${aggregationField}-${i}`}
            >
              <legend className={`${settings.prefix}--label ${settings.prefix}--refinement_label`}>
                {aggregationField}
              </legend>
              {orderedAggregationResults.map((result: DiscoveryV1.AggregationResult) => {
                const resultKey = result.key;
                const query = naturalLanguageQuery || '';
                const buff = new Buffer(query + resultKey);
                const base64data = buff.toString('base64');

                return (
                  <CarbonCheckbox
                    className={`${settings.prefix}--refinement-option_label`}
                    wrapperClassName={`${settings.prefix}--refinement-option`}
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
};
