import { useState, useEffect } from 'react';

const useDebounce = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return (): void => {
      window.clearTimeout(handler);
    };
  }, [delay, value]);
  return debouncedValue;
};

export default useDebounce;
