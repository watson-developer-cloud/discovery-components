import DiscoveryV2 from 'ibm-watson/discovery/v2';

export const getFieldNames = (response: DiscoveryV2.ListFieldsResponse | null): string[] => {
  if (response && response.fields) {
    const fieldObjects = response.fields;
    const fieldNames = fieldObjects.reduce((namesArray: string[], fieldObject) => {
      if (fieldObject.type === 'nested') {
        return namesArray;
      } else if (fieldObject.field && !namesArray.includes(fieldObject.field)) {
        namesArray.push(fieldObject.field);
      }
      return namesArray;
    }, []);
    return fieldNames;
  }
  return [];
};
