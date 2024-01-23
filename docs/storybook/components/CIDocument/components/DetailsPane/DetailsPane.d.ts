import { FC } from 'react';
import { Items, OnActiveLinkChangeFn } from './types';
import { Messages } from './messages';
interface DetailsPaneProps {
    items: Items[];
    selectedLink?: string;
    messages?: Messages;
    onActiveLinkChange: OnActiveLinkChangeFn;
}
declare const DetailsPane: FC<DetailsPaneProps>;
export default DetailsPane;
