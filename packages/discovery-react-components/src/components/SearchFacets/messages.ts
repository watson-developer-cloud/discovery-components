export interface Messages {
  labelText: string;
  labelTextWithCount: string;
  clearAllButtonText: string;
  clearFacetTitle: string;
  clearFacetSelectionTitle: string;
  collapsedFacetShowMoreText: string;
  collapsedFacetShowLessText: string;
  collapsedFacetShowAllText: string;
  collectionSelectTitleText: string;
  collectionSelectLabel: string;
  dynamicFacetsLabel: string;
  showMoreModalPrimaryButtonText: string;
  showMoreModalSecondaryButtonText: string;
  showMoreModalAriaLabel: string;
  categoryExpandCollapseIconDescription: string;
  modalSearchBarPrompt: string;
  emptyModalSearch: string;
}
export const defaultMessages: Messages = {
  labelText: '{facetText}',
  labelTextWithCount: '{facetText} ({count})',
  clearAllButtonText: 'Clear all',
  clearFacetTitle: 'Clear all selected items',
  clearFacetSelectionTitle: 'Clear selected item',
  collapsedFacetShowMoreText: 'Show more',
  collapsedFacetShowLessText: 'Show less',
  collapsedFacetShowAllText: 'Show all',
  collectionSelectTitleText: 'Collections',
  collectionSelectLabel: 'Available collections',
  dynamicFacetsLabel: 'Dynamic Facets',
  showMoreModalPrimaryButtonText: 'Apply',
  showMoreModalSecondaryButtonText: 'Cancel',
  showMoreModalAriaLabel: 'Modal to select and deselect facets',
  categoryExpandCollapseIconDescription: 'Expand/Collapse',
  modalSearchBarPrompt: 'Find',
  emptyModalSearch: 'There were no results found'
};
