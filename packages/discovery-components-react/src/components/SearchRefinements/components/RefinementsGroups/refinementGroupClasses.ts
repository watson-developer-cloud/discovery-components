import { settings } from 'carbon-components';

const baseClass = `${settings.prefix}--search-refinement`;

export const fieldsetClasses = [`${settings.prefix}--fieldset`, baseClass];
export const labelClasses = [`${settings.prefix}--label`, `${baseClass}__refinement__label`];
export const optionClass = `${baseClass}__refinement__option`;
export const optionLabelClass = `${baseClass}__refinement__option-label`;
