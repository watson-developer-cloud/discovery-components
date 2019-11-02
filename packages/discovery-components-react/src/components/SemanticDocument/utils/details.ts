import countby from 'lodash/countBy';
import capitalize from 'lodash/capitalize';
import { Items, Item } from '../components/DetailsPane/types';

const contractDetailsFromItem = (item: any): Items[] => [
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

const nonContractDetailsFromItem = (item: any): Items[] => {
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
  contracts: contractDetailsFromItem,
  invoices: nonContractDetailsFromItem,
  purchase_orders: nonContractDetailsFromItem
};

/**
 *
 * @param modelId
 * @return
 */
function getDetailsFromItem(modelId: string): (item: any) => Items[] {
  return modelMapping[modelId];
}

function getContractAttributes(attributes: any): Item[] {
  const typesWithCounts = getTypesWithCounts(attributes);
  return typesWithCounts.map(([type, count]: [string, number]) => {
    return { type: type, label: `${type} (${count})`, link: true };
  });
}

function getAttributesWithinRelation(attributes: any): Item[] {
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
