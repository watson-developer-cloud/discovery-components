import React, { FC, SyntheticEvent, useState, useEffect } from 'react';
import get from 'lodash/get';
import { Checkbox as CarbonCheckbox, Button } from 'carbon-components-react';
import {
  InternalQueryTermAggregation,
  SelectableQueryTermAggregationResult,
  SelectableFieldFacetWithType
} from '../../utils/searchFacetInterfaces';
import { optionClass, optionLabelClass } from '../../cssClasses';
import { Messages } from '../../messages';

interface FieldFacetsWithCategoryGroupProps {
  categoryFacets: any;
  /**
   * Callback to handle changes in selected facets
   */
  onChange: any;
  /**
   * Facets configuration with fields and results counts
   */
  allFacets: InternalQueryTermAggregation[];
  /**
   * i18n messages for the component
   */
  messages: Messages;
  /**
   * Number of facet terms to show when list is collapsed
   */
  collapsedFacetsCount: number;
  categoryName: string;
}

export const FieldFacetsWithCategoryGroup: FC<FieldFacetsWithCategoryGroupProps> = ({
  allFacets,
  categoryFacets,
  onChange,
  messages,
  collapsedFacetsCount,
  categoryName
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [isCollapsible, setIsCollapsible] = useState<boolean>(
    collapsedFacetsCount < categoryFacets.length
  );

  useEffect(() => {
    setIsCollapsed(collapsedFacetsCount < categoryFacets.length);
    setIsCollapsible(collapsedFacetsCount < categoryFacets.length);
  }, [collapsedFacetsCount, categoryFacets.length]);

  const toggleFacetsCollapse = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  const categoryFacetsToShow = isCollapsed
    ? categoryFacets.slice(0, collapsedFacetsCount - 1)
    : categoryFacets;

  const handleOnChange = (
    checked: boolean,
    _id: string,
    event: SyntheticEvent<HTMLInputElement>
  ): void => {
    const target: HTMLInputElement = event.currentTarget;
    const selectedFacetName = target.getAttribute('data-name') || '';
    const selectedFacetField = target.getAttribute('data-field') || '';
    const facetsForNameIndex = allFacets.findIndex(facet => {
      return facet.field === selectedFacetField;
    });

    if (facetsForNameIndex > -1) {
      const facetsForName = allFacets[facetsForNameIndex];
      const facetResults: SelectableQueryTermAggregationResult[] = get(
        facetsForName,
        'results',
        []
      );
      const selectedFacetResults: SelectableQueryTermAggregationResult[] = facetResults.map(
        result => {
          const key = get(result, 'key', '');

          return key === selectedFacetName
            ? Object.assign({}, result, { selected: checked })
            : result;
        }
      );
      allFacets[facetsForNameIndex].results = selectedFacetResults;
    }

    onChange({ filterFields: allFacets });
  };

  return (
    <div>
      {categoryFacetsToShow.map((facet: SelectableFieldFacetWithType) => {
        const buff = new Buffer(facet.field.replace(/\s+/g, '_') + facet.key);
        const base64data = buff.toString('base64');
        return (
          <CarbonCheckbox
            className={optionLabelClass}
            wrapperClassName={optionClass}
            labelText={`${facet.key} (${facet.matching_results})`}
            id={base64data}
            key={base64data}
            data-name={facet.key}
            data-field={facet.field}
            onChange={handleOnChange}
            checked={facet.selected}
          />
        );
      })}
      {isCollapsible && (
        <Button
          kind="ghost"
          size="small"
          onClick={toggleFacetsCollapse}
          data-testid={`show-more-less-${categoryName}`}
        >
          {isCollapsed ? messages.collapsedFacetShowMoreText : messages.collapsedFacetShowLessText}
        </Button>
      )}
    </div>
  );
};
