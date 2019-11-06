import * as React from 'react';

export const noAvailableFacetsMessage = 'There are no available facets.';
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
