import isEqual from 'lodash/isEqual';
import usePrevious from './usePrevioius';

export const useCompare = (val: any) => {
  const prevVal = usePrevious(val);
  return !isEqual(prevVal, val);
};

export default useCompare;
