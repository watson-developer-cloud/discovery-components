import { FilterGroup } from '../components/FilterPanel/types';

export interface FilterGroupWithFns extends Omit<FilterGroup, 'title'> {
  labelsFromItem: (item: any) => string[];
  applyFilter: (list: any[], label: string) => any[];
}

const contractFilterGroups: FilterGroupWithFns[] = [
  {
    id: 'CATEGORY',
    type: 'checkbox',
    labelsFromItem: item => item.categories.map((category: any) => category.label),
    applyFilter: (list, label) =>
      list.filter(item => item.categories.some((category: any) => category.label === label))
  },
  {
    id: 'NATURE',
    type: 'radio',
    labelsFromItem: item => item.types.map((type: any) => type.label.nature),
    applyFilter: (list, label) =>
      list.filter(item => item.types.some((type: any) => type.label.nature === label))
  },
  {
    id: 'PARTY',
    type: 'radio',
    labelsFromItem: item => item.types.map((type: any) => type.label.party),
    applyFilter: (list, label) =>
      list.filter(item => item.types.some((type: any) => type.label.party === label))
  },
  {
    id: 'ATTRIBUTES',
    type: 'checkbox',
    labelsFromItem: item => item.attributes.map((attribute: any) => attribute.type),
    applyFilter: (list, label) =>
      list.filter(item => item.attributes.some((attribute: any) => attribute.type === label))
  }
];

const nonContractFilterGroups: FilterGroupWithFns[] = [
  {
    id: 'attributes',
    type: 'radio',
    labelsFromItem: item => [item.type],
    applyFilter: (list, label) => list.filter(item => item.type === label)
  },
  {
    id: 'relations',
    type: 'radio',
    labelsFromItem: item => [item.type],
    applyFilter: (list, label) => list.filter(item => item.type === label)
  }
];

const modelMapping: { [key: string]: FilterGroupWithFns[] } = {
  contract: contractFilterGroups,
  invoice: nonContractFilterGroups,
  purchase_order: nonContractFilterGroups
};

const messagesMap = {
  CATEGORY: 'contractCategoryLabel',
  NATURE: 'contractNatureLabel',
  PARTY: 'contractPartyLabel',
  ATTRIBUTES: 'contractAttributeLabel',
  attributes: 'invoiceAttributeLabel',
  relations: 'invoiceRelationsLabel'
};

/**
 * Get the filter groups for the given model type
 *
 * @param {string} enrichmentName id of current model
 * @param {function} formatMessage intl formatMessage function
 * @param {string} selectedType selected type. (used for sharedDomains)
 * @returns a list of filter groups
 */
function getBaseFilterGroups(
  enrichmentName: string,
  messages: Record<string, string>
): FilterGroup[] {
  const groups = modelMapping[enrichmentName] || [];

  return groups.map(group => ({
    ...group,
    title: messages[messagesMap[group.id]]
  }));
}

export { getBaseFilterGroups };
