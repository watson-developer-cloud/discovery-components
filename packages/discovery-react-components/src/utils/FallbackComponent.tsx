import React from 'react';

export const FallbackComponent = (componentName: string) => {
  return () => <div> There was an error rendering {componentName}</div>;
};
