/// <reference types="react" />
import { Messages } from './messages';
export interface StructuredQueryProps {
    /**
     * override default messages for the component by specifying custom and/or internationalized text strings
     */
    messages?: Partial<Messages>;
}
declare const _default: import("react").ComponentType<StructuredQueryProps>;
export default _default;
