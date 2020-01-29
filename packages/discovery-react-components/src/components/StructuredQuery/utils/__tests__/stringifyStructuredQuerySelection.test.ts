import { stringifyStructuredQuerySelection } from '../stringifyStructuredQuerySelection';

describe('stringifyStructuredQuerySelection', () => {
  describe('when given one row of selections', () => {
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
});
