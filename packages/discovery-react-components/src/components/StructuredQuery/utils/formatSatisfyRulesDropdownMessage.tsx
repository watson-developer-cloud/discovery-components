import * as React from 'react';

export const formatSatisfyRulesDropdownMessage = (message: string, dropdown: JSX.Element) => {
  return message.split('%').map((element, i) => {
    return element === 'dropdown' ? dropdown : <p key={i}>{element}</p>;
  });
};
