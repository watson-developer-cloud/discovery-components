type SafeRefProps = {
    setRef: (node: HTMLElement | null) => void;
    node: HTMLElement | null;
};
declare const useSafeRef: () => SafeRefProps;
export default useSafeRef;
