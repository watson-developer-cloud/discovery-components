import { settings } from 'carbon-components';

const baseClass = `${settings.prefix}--search-facet`;

export const fieldsetClasses = [`${settings.prefix}--fieldset`, baseClass];
export const labelClasses = [`${settings.prefix}--label`, `${baseClass}__facet__label`];
export const optionClass = `${baseClass}__facet__option`;
export const optionLabelClass = `${baseClass}__facet__option-label`;
export const singleSelectGroupClass = `${baseClass}__facet__single__select__group`;
export const labelAndSelectionContainerClass = `${baseClass}__facet__label-and-selection-container`;

export const categoryClass = `${baseClass}--category`;
export const categoryExpandCollapseClass = `${categoryClass}--expand-collapse`;
export const categoryGroupNameClass = `${categoryClass}--category-name`;

export const collectionFacetIdPrefix = 'collection-facet-';
