import * as React from 'react';

export const noAvailableRefinementsMessage = 'There are no available refinements.';
export const invalidConfigurationMessage =
  'The Search Refinements component requires a valid configuration property. Please check and update with a valid configuration.';
export const displayMessage = (message: string) => {
  return (
    <div>
      <p>{message}</p>
    </div>
  );
};
export const consoleErrorMessage = (message: string) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(message);
  }
};
