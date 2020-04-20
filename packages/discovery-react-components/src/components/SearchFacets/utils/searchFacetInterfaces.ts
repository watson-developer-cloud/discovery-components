import DiscoveryV2 from 'ibm-watson/discovery/v2';

export interface QueryAggregationWithResults extends DiscoveryV2.QueryAggregation {
  results?: DiscoveryV2.QueryTermAggregationResult;
}

export interface SelectableQueryTermAggregationResult
  extends DiscoveryV2.QueryTermAggregationResult {
  selected?: boolean;
  aggregations?: QueryAggregationWithResults[];
}

export const isSelectableQueryTermAggregationResult = (
  facets: (SelectableDynamicFacets | SelectableQueryTermAggregationResult)[]
): facets is SelectableQueryTermAggregationResult[] => {
  return (facets as SelectableQueryTermAggregationResult[])[0].key !== undefined;
};

export interface InternalQueryTermAggregation
  extends Omit<DiscoveryV2.QueryTermAggregation, 'results'> {
  results?: SelectableQueryTermAggregationResult[];
  label?: string;
  name?: string;
  // Keeping this as snake to match the SDK, otherwise this becomes a headache
  // of toggling between two cases.
  multiple_selections_allowed?: boolean;
}

export interface SearchFilterFacets {
  filterFields: InternalQueryTermAggregation[];
  filterDynamic: SelectableDynamicFacets[];
}

export interface SelectableDynamicFacets extends DiscoveryV2.QuerySuggestedRefinement {
  matching_results?: number;
  selected?: boolean;
  aggregations?: QueryAggregationWithResults[];
  key?: string;
}

export interface SelectedCollectionItems {
  selectedItems: CollectionItem[];
}

export interface CollectionItem {
  id: string;
  label: string;
}

export interface QueryAggregationWithName extends DiscoveryV2.QueryAggregation {
  field: string;
  count?: number;
  name?: string;
  path?: string;
  match?: string;
  aggregations?: QueryAggregationWithName[];
}

export const isQueryAggregationWithName = (
  aggregations?: (DiscoveryV2.QueryAggregation | QueryAggregationWithName)[]
): aggregations is QueryAggregationWithName[] => {
  return (
    (aggregations as QueryAggregationWithName[])[0].field !== undefined ||
    (aggregations as QueryAggregationWithName[])[0].path !== undefined ||
    (aggregations as QueryAggregationWithName[])[0].match !== undefined
  );
};

export interface SelectableFieldFacetWithCategory {
  key: string;
  matching_results?: number;
  selected: boolean;
}

export interface FieldFacetsByCategory {
  [facetLabel: string]: {
    categories: {
      [resultType: string]: {
        facets: SelectableFieldFacetWithCategory[];
      };
    };
  };
}

export interface FieldFacetsByCategoryEntity {
  [0]: string;
  [1]: {
    facets: SelectableFieldFacetWithCategory[];
  };
}
