import { isValidSelection } from '../isValidSelection';
import { StructuredQuerySelection } from '../structuredQueryInterfaces';

describe('isValidSelection', () => {
  describe('with valid structuredQuerySelection', () => {
    describe('with one valid row', () => {
      it('should return true as it is valid', () => {
        const selectionWithOneRowValid: StructuredQuerySelection = {
          groups: {
            0: { rows: [0], operator: ',' }
          },
          rows: {
            0: {
              field: 'example_field_0',
              operator: '::',
              value: 'watson'
            }
          },
          group_order: [0]
        };

        expect(isValidSelection(selectionWithOneRowValid)).toEqual(true);
      });
    });

    describe('with multiple valid rows in one group', () => {
      it('should return true as it is valid', () => {
        const selectionWithMultipleValidRows: StructuredQuerySelection = {
          groups: {
            0: { rows: [0, 1], operator: ',' }
          },
          rows: {
            0: {
              field: 'example_field_0',
              operator: '::',
              value: 'watson'
            },
            0: {
              field: 'example_field_1',
              operator: '::',
              value: 'watson'
            }
          },
          group_order: [0]
        };

        expect(isValidSelection(selectionWithMultipleValidRows)).toEqual(true);
      });
    });

    describe('with multiple valid rows in multiple groups', () => {
      it('should return true as it is valid', () => {
        const selectionWithMultipleGroupsAndValidRows: StructuredQuerySelection = {
          groups: {
            0: { rows: [0, 1], operator: ',' },
            1: { rows: [2, 3], operator: ',' }
          },
          rows: {
            0: {
              field: 'example_field_0',
              operator: '::',
              value: 'watson'
            },
            1: {
              field: 'example_field_1',
              operator: '::',
              value: 'watson'
            },
            2: {
              field: 'example_field_2',
              operator: '::',
              value: 'watson'
            },
            3: {
              field: 'example_field_3',
              operator: '::',
              value: 'watson'
            }
          },
          group_order: [0, 1]
        };

        expect(isValidSelection(selectionWithMultipleGroupsAndValidRows)).toEqual(true);
      });
    });
  });

  describe('with invalid structuredQuerySelection', () => {
    describe('with one row valid and another invalid', () => {
      it('should return false as it is invalid', () => {
        const selectionOneRowValidAndOneInvalid: StructuredQuerySelection = {
          groups: {
            0: { rows: [0, 1], operator: ',' }
          },
          rows: {
            0: {
              field: 'example_field_0',
              operator: '::',
              value: 'watson'
            },
            1: {
              field: null,
              operator: null,
              value: ''
            }
          },
          group_order: [0]
        };

        expect(isValidSelection(selectionOneRowValidAndOneInvalid)).toEqual(false);
      });
    });

    describe('with only an operator selection missing', () => {
      it('should return false as it is invalid', () => {
        const selectionWithOperatorMissing: StructuredQuerySelection = {
          groups: {
            0: { rows: [0], operator: ',' }
          },
          rows: {
            0: {
              field: 'example_field_0',
              operator: null,
              value: 'watson'
            }
          },
          group_order: [0]
        };

        expect(isValidSelection(selectionWithOperatorMissing)).toEqual(false);
      });
    });

    describe('with only a field selection missing', () => {
      it('should return false as it is invalid', () => {
        const selectionWithFieldMissing: StructuredQuerySelection = {
          groups: {
            0: { rows: [0], operator: ',' }
          },
          rows: {
            0: {
              field: null,
              operator: '::',
              value: 'watson'
            }
          },
          group_order: [0]
        };

        expect(isValidSelection(selectionWithFieldMissing)).toEqual(false);
      });
    });

    describe('with only a value selection missing', () => {
      it('should return false as it is invalid', () => {
        const selectionWithValueMissing: StructuredQuerySelection = {
          groups: {
            0: { rows: [0], operator: ',' }
          },
          rows: {
            0: {
              field: 'example_field_0',
              operator: '::',
              value: ''
            }
          },
          group_order: [0]
        };

        expect(isValidSelection(selectionWithValueMissing)).toEqual(false);
      });
    });
  });
});
