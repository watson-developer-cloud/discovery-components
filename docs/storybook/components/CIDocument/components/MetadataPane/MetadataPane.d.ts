import { FC } from 'react';
import { Party, OnActiveMetadataChangeFn, OnActivePartyChangeFn } from './types';
import { Metadata } from 'components/CIDocument/types';
import { Messages } from './messages';
interface MetadataPaneProps {
    metadata?: Metadata[];
    parties?: Party[];
    activeMetadataId?: string;
    messages?: Messages;
    onActiveMetadataChange: OnActiveMetadataChangeFn;
    onActivePartyChange: OnActivePartyChangeFn;
}
declare const MetadataPane: FC<MetadataPaneProps>;
export default MetadataPane;
