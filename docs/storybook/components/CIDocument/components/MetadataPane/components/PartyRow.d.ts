import { FC } from 'react';
import { Party, OnActivePartyChangeFn } from '../types';
interface PartyRowProps {
    party: Party;
    activeMetadataId?: string;
    addressesHeading?: string;
    contactsHeading?: string;
    onActivePartyChange: OnActivePartyChangeFn;
}
declare const PartyRow: FC<PartyRowProps>;
export default PartyRow;
