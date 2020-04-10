import React, { FC, useState, useEffect } from 'react';
import { Button } from 'carbon-components-react';
import filter from 'lodash/filter';
import get from 'lodash/get';
import ListBox from 'carbon-components-react/lib/components/ListBox';
import { fieldsetClasses, labelClasses, labelAndSelectionContainerClass } from '../../cssClasses';
import {
  SelectableDynamicFacets,
  SelectableQueryTermAggregationResult,
  InternalQueryTermAggregation
} from 'components/SearchFacets/utils/searchFacetInterfaces';
import { Messages } from 'components/SearchFacets/messages';
import { MultiSelectFacetsGroup } from './MultiSelectFacetsGroup';
import { SingleSelectFacetsGroup } from './SingleSelectFacetsGroup';
import { ShowMoreModal } from './ShowMoreModal';

interface CollapsibleFacetsGroupProps {
  /**
   * Facets configuration with fields and results counts
   */
  facets: (SelectableDynamicFacets | SelectableQueryTermAggregationResult)[];
  /**
   * Aggregation component settings
   */
  aggregationSettings: InternalQueryTermAggregation;
  /**
   * How many facets should be shown
   */
  collapsedFacetsCount: number;
  /**
   * i18n messages for the component
   */
  messages: Messages;
  /**
   * Facet text field
   */
  facetsTextField: 'key' | 'text';
  /**
   * Callback to handle changes in selected facets
   */
  onChange: (selectedFacetName: string, selectedFacetKey: string, checked: boolean) => void;
  /**
   * Callback to reset selected facet
   */
  onClear: (selectedFacetName: string) => void;
}

export const CollapsibleFacetsGroup: FC<CollapsibleFacetsGroupProps> = ({
  facets,
  aggregationSettings,
  collapsedFacetsCount,
  facetsTextField,
  messages,
  onClear,
  onChange
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(collapsedFacetsCount < facets.length);
  const [isCollapsible, setIsCollapsible] = useState<boolean>(collapsedFacetsCount < facets.length);

  useEffect(() => {
    setIsCollapsed(collapsedFacetsCount < facets.length);
    setIsCollapsible(collapsedFacetsCount < facets.length);
  }, [collapsedFacetsCount, facets.length]);

  const toggleFacetsCollapse = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  const areMultiSelectionsAllowed = aggregationSettings.multiple_selections_allowed;
  const facetsLabel = aggregationSettings.label || aggregationSettings.field;
  const collapsedFacets = isCollapsed ? facets.slice(0, collapsedFacetsCount) : facets;
  const totalNumberFacets = facets.length;
  const selectedFacets = filter(facets, ['selected', true]);
  const selectedFacetText = get(selectedFacets[0], facetsTextField, '');
  const shouldDisplayAsMultiSelect = areMultiSelectionsAllowed || selectedFacets.length > 1;
  const shouldDisplayClearButton = shouldDisplayAsMultiSelect && selectedFacets.length > 0;
  const handleClearFacets = (): void => {
    onClear(aggregationSettings.name || aggregationSettings.field);
  };

  const translateWithId = (id: string): string => {
    const mapping = {
      'clear.all': messages.clearFacetTitle,
      'clear.selection': messages.clearFacetSelectionTitle
    };
    return mapping[id];
  };

  return (
    <fieldset className={fieldsetClasses.join(' ')}>
      <legend className={labelClasses.join(' ')}>
        <div className={labelAndSelectionContainerClass}>
          {facetsLabel}
          {shouldDisplayClearButton && (
            <ListBox.Selection
              clearSelection={handleClearFacets}
              selectionCount={selectedFacets.length}
              translateWithId={translateWithId}
            />
          )}
        </div>
      </legend>
      {shouldDisplayAsMultiSelect ? (
        <MultiSelectFacetsGroup
          messages={messages}
          facets={collapsedFacets}
          aggregationSettings={aggregationSettings}
          onChange={onChange}
          facetsTextField={facetsTextField}
        />
      ) : (
        <SingleSelectFacetsGroup
          messages={messages}
          facets={collapsedFacets}
          aggregationSettings={aggregationSettings}
          onChange={onChange}
          selectedFacet={selectedFacetText}
          facetsTextField={facetsTextField}
        />
      )}
      <>
        {isCollapsible && totalNumberFacets < 10 && (
          <Button kind="ghost" size="small" onClick={toggleFacetsCollapse}>
            {isCollapsed
              ? messages.collapsedFacetShowMoreText
              : messages.collapsedFacetShowLessText}
          </Button>
        )}
        {isCollapsible && totalNumberFacets >= 10 && (
          <ShowMoreModal
            messages={messages}
            aggregationSettings={aggregationSettings}
            facets={facets}
            facetsLabel={facetsLabel}
            facetsTextField={facetsTextField}
          />
        )}
      </>
    </fieldset>
  );
};
