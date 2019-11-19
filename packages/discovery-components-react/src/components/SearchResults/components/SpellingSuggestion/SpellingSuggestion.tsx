import React, { FC, useContext, SyntheticEvent } from 'react';
import { settings } from 'carbon-components';
import { Button as CarbonButton } from 'carbon-components-react';
import { SearchApi, SearchContext } from '../../../DiscoverySearch/DiscoverySearch';
import DiscoveryV2 from 'ibm-watson/discovery/v2';
import { useDeepCompareCallback } from '../../../../utils/useDeepCompareMemoize';

interface SpellingSuggestionProps {
  /**
   * Message prefix used when displaying spelling suggestion
   */
  spellingSuggestionPrefix?: string;
}

export const SpellingSuggestion: FC<SpellingSuggestionProps> = ({ spellingSuggestionPrefix }) => {
  const spellingSuggestionClassName = `${settings.prefix}--spelling-suggestion`;
  const spellingSuggestionWrapperClassName = `${settings.prefix}--spelling-suggestion__wrapper`;
  const {
    searchResponseStore: { parameters: searchParameters, data: searchResponse }
  } = useContext(SearchContext);
  const { performSearch } = useContext(SearchApi);
  const suggestedQuery = searchResponse && searchResponse.suggested_query;

  const prepareFreshSearchParameters = useDeepCompareCallback(
    (nlq: string): DiscoveryV2.QueryParams => {
      return {
        ...searchParameters,
        naturalLanguageQuery: nlq,
        offset: 0,
        filter: ''
      };
    },
    [searchParameters]
  );

  const selectSuggestion = (evt: SyntheticEvent<EventTarget>): void => {
    evt.preventDefault();
    if (!!suggestedQuery) {
      performSearch(prepareFreshSearchParameters(suggestedQuery));
    }
  };

  return (
    <>
      {!!suggestedQuery && (
        <div className={spellingSuggestionWrapperClassName}>
          {spellingSuggestionPrefix}
          <CarbonButton
            className={spellingSuggestionClassName}
            onClick={selectSuggestion}
            kind="ghost"
            size="small"
          >
            {suggestedQuery}
          </CarbonButton>
        </div>
      )}
    </>
  );
};
