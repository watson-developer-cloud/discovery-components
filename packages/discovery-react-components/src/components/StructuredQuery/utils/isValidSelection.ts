import { StructuredQuerySelection } from './structuredQueryInterfaces';

export const isValidSelection = (structuredQuerySelection: StructuredQuerySelection) => {
  const missingFields = Object.keys(structuredQuerySelection.rows).filter(
    row => structuredQuerySelection.rows[row].field === null
  );
  const missingOperators = Object.keys(structuredQuerySelection.rows).filter(
    row => structuredQuerySelection.rows[row].operator === null
  );
  const missingValues = Object.keys(structuredQuerySelection.rows).filter(
    row => structuredQuerySelection.rows[row].value === ''
  );
  return missingFields.length + missingOperators.length + missingValues.length === 0;
};
