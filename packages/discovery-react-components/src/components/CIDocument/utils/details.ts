import countby from 'lodash/countBy';
import capitalize from 'lodash/capitalize';
import { Items, Item } from '../components/DetailsPane/types';

export const contractDetailsFromItem = (item: any): Items[] => [
  {
    heading: 'categories',
    items: item.categories
  },
  {
    heading: 'types',
    items: getTypeDetails(item.types)
  },
  { heading: 'attributes', items: getContractAttributes(item.attributes) }
];

export const nonContractDetailsFromItem = (item: any): Items[] => {
  const details = [
    {
      heading: 'type',
      items: [item.type]
    }
  ];
  if (item.attributes) {
    details.push({
      heading: 'attributes',
      items: getAttributesWithinRelation(item.attributes)
    });
  }
  return details;
};

const modelMapping = {
  contract: contractDetailsFromItem,
  invoice: nonContractDetailsFromItem,
  purchase_order: nonContractDetailsFromItem
};

/**
 *
 * @param enrichmentName
 * @return
 */
function getDetailsFromItem(enrichmentName: string): (item: any) => Items[] {
  return modelMapping[enrichmentName];
}

function getContractAttributes(attributes: any): Item[] {
  const typesWithCounts = getTypesWithCounts(attributes);
  return typesWithCounts.map(([type, count]: [string, number]) => {
    return { type: type, label: `${type} (${count})`, link: true };
  });
}

export function getAttributesWithinRelation(attributes: any): Item[] {
  return attributes.map(({ type, text }: { type: string; text: string }) => {
    return {
      type: type,
      value: { label: text },
      link: true
    };
  });
}

function getTypesWithCounts(types: any): any {
  return Object.entries(countby(types, ({ type }) => type));
}

function getTypeDetails(types: any): Item[] {
  return types.map(({ label }: { label: string }) =>
    Object.entries(label)
      .map(([key, value]) => `${capitalize(key)}: ${value}`)
      .join(', ')
  );
}

function getDetailsFromMetadata(data: any): Items[] {
  if (data.metadataType) {
    return [{ heading: 'type', items: [data.metadataType] }];
  }
  return [{ heading: 'party', items: [data.text.toUpperCase()] }];
}

export { getDetailsFromItem, getDetailsFromMetadata };
