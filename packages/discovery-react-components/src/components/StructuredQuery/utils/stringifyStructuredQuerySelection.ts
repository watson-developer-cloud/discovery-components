import { StructuredQuerySelection } from './structuredQueryInterfaces';

export const stringifyStructuredQuerySelection = (
  structuredQuerySelection: StructuredQuerySelection
) => {
  let stringifiedStructuredQuerySelection: string = '';
  stringifiedStructuredQuerySelection += structuredQuerySelection.group_order
    .map(groupId => {
      return groupId === 0
        ? stringifyRows(structuredQuerySelection, groupId)
        : '(' + stringifyRows(structuredQuerySelection, groupId) + ')';
    })
    .join(structuredQuerySelection.groups[0].operator);
  return stringifiedStructuredQuerySelection;
};

const stringifyRows = (structuredQuerySelection: StructuredQuerySelection, groupId: number) => {
  return structuredQuerySelection.groups[groupId].rows
    .map((rowId: number) => {
      const row = structuredQuerySelection.rows[rowId];
      const rowField = escapeReservedCharacters(row.field);
      const rowValue = row.value === '' ? row.value : '"' + escapeDoubleQuotes(row.value) + '"';
      return `${rowField}${row.operator}${rowValue}`;
    })
    .join(structuredQuerySelection.groups[groupId].operator);
};

const escapeDoubleQuotes = (value: string) => {
  return value.replace(/(["])/g, '\\"');
};

const escapeReservedCharacters = (field: string) => {
  const escapeCharacters = (match: string) => {
    return match.replace(match, `\\${match}`);
  };
  const regexForReservedCharacters = /([,|:!"\\()[\]^~<>*])/g;
  return field.replace(regexForReservedCharacters, escapeCharacters);
};
