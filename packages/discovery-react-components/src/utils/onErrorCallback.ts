const onErrorCallback = (error: Error, componentStack: string): void => {
  console.error(error, componentStack);
};

export default onErrorCallback;
