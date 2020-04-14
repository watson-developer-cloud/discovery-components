export interface Messages {
  labelText: string;
  labelTextWithCount: string;
  clearAllButtonText: string;
  clearFacetTitle: string;
  clearFacetSelectionTitle: string;
  collapsedFacetShowMoreText: string;
  collapsedFacetShowLessText: string;
  collectionSelectTitleText: string;
  collectionSelectLabel: string;
  dynamicFacetsLabel: string;
  categoryExpandCollapseIconDescription: string;
}
export const defaultMessages: Messages = {
  labelText: '{facetText}',
  labelTextWithCount: '{facetText} ({count})',
  clearAllButtonText: 'Clear all',
  clearFacetTitle: 'Clear all selected items',
  clearFacetSelectionTitle: 'Clear selected item',
  collapsedFacetShowMoreText: 'Show more',
  collapsedFacetShowLessText: 'Show less',
  collectionSelectTitleText: 'Collections',
  collectionSelectLabel: 'Available collections',
  dynamicFacetsLabel: 'Dynamic Facets',
  categoryExpandCollapseIconDescription: 'Expand/Collapse'
};
