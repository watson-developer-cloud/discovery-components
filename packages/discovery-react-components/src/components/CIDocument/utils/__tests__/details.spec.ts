import {
  getDetailsFromItem,
  getDetailsFromMetadata,
  contractDetailsFromItem,
  nonContractDetailsFromItem,
  getAttributesWithinRelation
} from '../details';

describe('details utility', () => {
  describe('getDetailsFromItem', () => {
    it('contract', () => {
      const itemDetails = getDetailsFromItem('contract');
      expect(itemDetails).toEqual(contractDetailsFromItem);
    });
    it('invoice', () => {
      const itemDetails = getDetailsFromItem('invoice');
      expect(itemDetails).toEqual(nonContractDetailsFromItem);
    });
    it('purchase order', () => {
      const itemDetails = getDetailsFromItem('purchase_order');
      expect(itemDetails).toEqual(nonContractDetailsFromItem);
    });
  });

  describe('getDetailsFromMetadata', () => {
    const mockData = {
      metadataType: 'effective_dates',
      text: '24th October 2011'
    };

    const mockDataNoMeta = { text: '24th October 2011' };

    const mockResponseWithType = [{ heading: 'type', items: ['effective_dates'] }];
    const mockResponseNoType = [{ heading: 'party', items: ['24TH OCTOBER 2011'] }];

    it('contract', () => {
      const metadataDetails = getDetailsFromMetadata(mockData);
      expect(metadataDetails).toEqual(mockResponseWithType);
    });
    it('no metadata type', () => {
      const metadataDetails = getDetailsFromMetadata(mockDataNoMeta);
      expect(metadataDetails).toEqual(mockResponseNoType);
    });
  });

  describe('nonContractDetailsFromItem with item attributes', () => {
    const mockItem = { type: 'invoice_parts' };

    const mockItemWithAttributes = {
      type: 'invoice_parts',
      attributes: [
        {
          type: 'quantity_ordered',
          text: '252',
          location: { begin: 1876, end: 1879 }
        }
      ],
      relations: [
        {
          type: 'unit_price',
          attributes: [
            {
              type: 'amount',
              text: '11.80',
              location: { begin: 2435, end: 2440 }
            }
          ],
          relations: [],
          allAttributeIds: ['2435_2440', '1618_1621']
        }
      ],
      allAttributeIds: ['2435_2440', '1618_1621']
    };

    it('invoice', () => {
      const itemDetails = nonContractDetailsFromItem(mockItem);
      const itemDetailsWithAttributes = nonContractDetailsFromItem(mockItemWithAttributes);

      itemDetails.push({
        heading: 'attributes',
        items: getAttributesWithinRelation(mockItemWithAttributes.attributes)
      });

      expect(itemDetails).toEqual(itemDetailsWithAttributes);
    });
  });
});
