import React, { ReactNode } from 'react';

interface SubstitutionValues {
  [name: string]: ReactNode;
}
const SPLIT_VARIABLES_REGEX = /({[^}]+})/;

export const formatMessage = (
  message: string,
  values: SubstitutionValues,
  outputJsx: boolean = true
) => {
  return message.split(SPLIT_VARIABLES_REGEX).map((part, i) => {
    const variableWithoutBraces = part.replace(/{/g, '').replace(/}/g, '');
    if (part === '') {
      return part;
    }
    return part.includes('{') ? (
      outputJsx ? (
        <div key={i}>{values[variableWithoutBraces]}</div>
      ) : (
        values[variableWithoutBraces]
      )
    ) : outputJsx ? (
      <span key={i}>{part}</span>
    ) : (
      part
    );
  });
};
