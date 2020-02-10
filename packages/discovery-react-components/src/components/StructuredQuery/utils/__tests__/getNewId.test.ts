import { getNewId } from '../getNewId';
import { StructuredQuerySelection } from '../structuredQueryInterfaces';

describe('getNewId', () => {
  describe('when given multiple current groups', () => {
    it('should return a new id that is one more than the max out of the current group ids', () => {
      const currentGroups: StructuredQuerySelection['groups'] = {
        0: { rows: [0, 1, 2], operator: ',' },
        2: { rows: [3, 4, 5], operator: '|' },
        1: { rows: [6, 7], operator: ',' }
      };

      expect(getNewId(currentGroups)).toEqual(3);
    });
  });

  describe('when given multiple current rows', () => {
    const currentRows: StructuredQuerySelection['rows'] = {
      0: {
        field: 'example_field_0',
        operator: '::',
        value: 'watson'
      },
      3: {
        field: 'example_field_1',
        operator: ':!',
        value: 'machine'
      },
      1: {
        field: 'example_field_2',
        operator: ':',
        value: 'learning'
      },
      2: {
        field: 'example_field_1',
        operator: ':!',
        value: 'machine'
      }
    };

    expect(getNewId(currentRows)).toEqual(4);
  });
});
