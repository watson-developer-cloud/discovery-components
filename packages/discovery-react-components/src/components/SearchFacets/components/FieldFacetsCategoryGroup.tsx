import React, { FC, SyntheticEvent, useState } from 'react';
import get from 'lodash/get';
import { Checkbox as CarbonCheckbox, Button } from 'carbon-components-react';
import {
  InternalQueryTermAggregation,
  SelectableQueryTermAggregationResult
} from '../utils/searchFacetInterfaces';

interface FieldFacetsCategoryGroupProps {
  categoryFacets: any;
  onChange: any;
  expanded: boolean;
  allFacets: InternalQueryTermAggregation[];
}

export const FieldFacetsCategoryGroup: FC<FieldFacetsCategoryGroupProps> = ({
  allFacets,
  categoryFacets,
  onChange,
  expanded
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  const toggleFacetsCollapse = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  const categoryFacetsToShow = isCollapsed ? categoryFacets.slice(0, 4) : categoryFacets;

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

  if (expanded) {
    return (
      // todo; add styling of padding-left 1rem to this
      <div className={'bx--category-wrapper'}>
        {categoryFacetsToShow.map((facet: any) => {
          const buff = new Buffer(facet.field.replace(/\s+/g, '_') + facet.key);
          const base64data = buff.toString('base64');
          return (
            <CarbonCheckbox
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
        <Button kind="ghost" size="small" onClick={toggleFacetsCollapse}>
          {/* todo: should only show more if there are actually more to show */}
          {isCollapsed ? 'Show more' : 'Show less'}
        </Button>
      </div>
    );
  } else {
    return <div></div>;
  }
};
