type Size = {
    width: number;
    height: number;
};
/**
 * This hook is similar to the useSize hook shipped with @react-hook,
 * but uses getBoundingClientRect for more precise measurements
 *
 * @param target A React ref of the element to be measured
 */
declare const useSize: (target: HTMLElement | null) => Size;
export default useSize;
