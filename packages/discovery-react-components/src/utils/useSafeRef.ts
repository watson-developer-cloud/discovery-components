import { useState, useCallback } from 'react';

// A hook to create a ref whose node can be used in effects
// This is necessary to avoid issues with useRef not notifying effects about changes
// @see https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node

type SafeRefProps = {
  setRef: (node: HTMLElement | null) => void;
  node: HTMLElement | null;
};

const useSafeRef = (): SafeRefProps => {
  const [node, setNode] = useState(null);

  const setRef = useCallback(node => {
    setNode(node);
  }, []);

  return { setRef, node };
};

export default useSafeRef;
