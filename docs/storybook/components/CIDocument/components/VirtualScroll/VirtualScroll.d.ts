import { ReactElement } from 'react';
interface RowRenderArgs {
    index: number;
}
interface VirtualScrollProps {
    children: (args: RowRenderArgs) => ReactElement;
    rowCount: number;
    width?: number;
    height?: number;
}
declare const _default: import("react").ForwardRefExoticComponent<VirtualScrollProps & import("react").RefAttributes<any>>;
export default _default;
