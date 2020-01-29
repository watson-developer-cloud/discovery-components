import { StructuredQuerySelection } from './structuredQueryInterfaces';

export const stringifyStructuredQuerySelection = (
  structuredQuerySelection: StructuredQuerySelection
) => {
  let stringifiedStructuredQuerySelection: string = '';
  stringifiedStructuredQuerySelection += Object.keys(structuredQuerySelection.groups)
    .map(groupId => {
      return '(' + stringifyRows(structuredQuerySelection, groupId) + ')';
    })
    .join(structuredQuerySelection.groups[0].operator);
  return stringifiedStructuredQuerySelection;
};

const stringifyRows = (structuredQuerySelection: StructuredQuerySelection, groupId: string) => {
  return structuredQuerySelection.groups[groupId].rows
    .map((rowId: string) => {
      const row = structuredQuerySelection.rows[rowId];
      return `${row.field}${row.operator}${row.value}`;
    })
    .join(structuredQuerySelection.groups[groupId].operator);
};
