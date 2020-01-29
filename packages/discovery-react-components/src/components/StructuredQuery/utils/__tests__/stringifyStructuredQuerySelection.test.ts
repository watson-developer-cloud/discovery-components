import { stringifyStructuredQuerySelection } from '../stringifyStructuredQuerySelection';

describe('stringifyStructuredQuerySelection', () => {
  describe('when given one top-level group of selections', () => {
    describe('and one row of selections', () => {
      it('returns the expected query string', () => {
        const structuredQuerySelectionWithOneRow = {
          groups: {
            0: { rows: [0], operator: ',' }
          },
          rows: {
            0: {
              field: 'example_field',
              operator: '::',
              value: 'watson'
            }
          },
          group_order: [0]
        };

        expect(stringifyStructuredQuerySelection(structuredQuerySelectionWithOneRow)).toEqual(
          '(example_field::watson)'
        );
      });
    });

    describe('and three rows of selections', () => {
      it('returns the expected query string', () => {
        const structuredQuerySelectionWithThreeRows = {
          groups: {
            0: { rows: [0, 1, 2], operator: ',' }
          },
          rows: {
            0: {
              field: 'example_field_0',
              operator: '::',
              value: 'watson'
            },
            1: {
              field: 'example_field_1',
              operator: ':!',
              value: 'machine'
            },
            2: {
              field: 'example_field_2',
              operator: ':',
              value: 'learning'
            }
          },
          group_order: [0]
        };

        expect(stringifyStructuredQuerySelection(structuredQuerySelectionWithThreeRows)).toEqual(
          '(example_field_0::watson,example_field_1:!machine,example_field_2:learning)'
        );
      });
    });
  });

  describe('when given a top-level group and nested groups of selections', () => {
    describe('with multiple groups with multiple rows each and different operators', () => {
      const structuredQuerySelectionWithMultipleGroupsAndRows = {
        groups: {
          0: { rows: [0, 1, 2], operator: ',' },
          1: { rows: [3, 4, 5], operator: '|' },
          2: { rows: [6, 7], operator: ',' }
        },
        rows: {
          0: {
            field: 'example_field_0',
            operator: '::',
            value: 'watson'
          },
          1: {
            field: 'example_field_1',
            operator: ':!',
            value: 'machine'
          },
          2: {
            field: 'example_field_2',
            operator: ':',
            value: 'learning'
          },
          3: {
            field: 'example_field_3',
            operator: ':',
            value: 'IBM'
          },
          4: {
            field: 'example_field_4',
            operator: '::!',
            value: 'regression'
          },
          5: {
            field: 'example_field_5',
            operator: ':!',
            value: 'neural'
          },
          6: {
            field: 'example_field_6',
            operator: ':',
            value: 'network'
          },
          7: {
            field: 'example_field_7',
            operator: '::',
            value: 'classification'
          }
        },
        group_order: [0, 1, 2]
      };

      expect(
        stringifyStructuredQuerySelection(structuredQuerySelectionWithMultipleGroupsAndRows)
      ).toEqual(
        '(example_field_0::watson,example_field_1:!machine,example_field_2:learning),(example_field_3:IBM|example_field_4::!regression|example_field_5:!neural),(example_field_6:network,example_field_7::classification)'
      );
    });
  });
});
