import { FC } from 'react';
import { Messages } from './messages';
type ChangeFn = (index: number) => void;
export interface NavigationToolbarProps {
    className?: string;
    index?: number;
    max: number;
    messages?: Messages;
    onChange: ChangeFn;
}
declare const NavigationToolbar: FC<NavigationToolbarProps>;
export default NavigationToolbar;
