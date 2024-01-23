import { FC } from 'react';
import { Item, OnActiveLinkChangeFn } from './types';
import { Messages } from './messages';
interface DetailsProps {
    title: string;
    items: Item[];
    selectedLink?: string;
    messages?: Messages;
    onClick: OnActiveLinkChangeFn;
}
declare const Details: FC<DetailsProps>;
export default Details;
