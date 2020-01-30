import { StructuredQuerySelection } from './structuredQueryInterfaces';

export const stringifyStructuredQuerySelection = (
  structuredQuerySelection: StructuredQuerySelection
) => {
  let stringifiedStructuredQuerySelection: string = '';
  stringifiedStructuredQuerySelection += Object.keys(structuredQuerySelection.groups)
    .map(groupId => {
      return groupId === '0'
        ? stringifyRows(structuredQuerySelection, groupId)
        : '(' + stringifyRows(structuredQuerySelection, groupId) + ')';
    })
    .join(structuredQuerySelection.groups[0].operator);
  return stringifiedStructuredQuerySelection;
};

const stringifyRows = (structuredQuerySelection: StructuredQuerySelection, groupId: string) => {
  return structuredQuerySelection.groups[groupId].rows
    .map((rowId: string) => {
      const row = structuredQuerySelection.rows[rowId];
      const rowField = containsReservedCharacters(row.field) ? '"' + row.field + '"' : row.field;
      const rowValue = containsReservedCharacters(row.value) ? '"' + row.value + '"' : row.value;
      return `${rowField}${row.operator}${rowValue}`;
    })
    .join(structuredQuerySelection.groups[groupId].operator);
};

const containsReservedCharacters = (fieldOrValue: string) => {
  // Reserved characters include , | : ! as they are used as operators in the query
  const regexForReservedCharacters = /([,|:!])+/g;
  return fieldOrValue.match(regexForReservedCharacters) !== null;
};
