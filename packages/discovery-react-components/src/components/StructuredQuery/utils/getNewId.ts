import { StructuredQuerySelection } from './structuredQueryInterfaces';

export const getNewId = (
  currentGroupsOrRows: StructuredQuerySelection['rows'] | StructuredQuerySelection['groups']
) => {
  const maxId = Object.keys(currentGroupsOrRows).reduce((previousId, currentId) =>
    Math.max(parseInt(previousId), parseInt(currentId)).toString()
  );
  return parseInt(maxId) + 1;
};
