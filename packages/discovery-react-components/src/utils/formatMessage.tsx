import * as React from 'react';

interface SubstitutionValues {
  [name: string]: React.ReactNode;
}
const SPLIT_VARIABLES_REGEX = /({[^}]+})/;

export const formatMessage = (message: string, values: SubstitutionValues) => {
  return message.split(SPLIT_VARIABLES_REGEX).map((part, i) => {
    const variableWithoutBraces = part.replace(/{/g, '').replace(/}/g, '');
    if (part === '') {
      return part;
    }
    return part.includes('{') ? (
      <div key={i}>{values[variableWithoutBraces]}</div>
    ) : (
      <span key={i}>{part}</span>
    );
  });
};
