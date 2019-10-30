import React, { FC } from 'react';
import { settings } from 'carbon-components';
import { Metadata, Party, OnActiveMetadataChangeFn, OnActivePartyChangeFn } from './types';
import MetadataRow from './components/MetadataRow';
import PartyRow from './components/PartyRow';

interface MetadataPaneProps {
  metadata?: Metadata[];
  parties?: Party[];
  activeMetadataId?: string;
  partiesHeading?: string;
  onActiveMetadataChange: OnActiveMetadataChangeFn;
  onActivePartyChange: OnActivePartyChangeFn;
}

const MetadataPane: FC<MetadataPaneProps> = ({
  metadata = [],
  parties = [],
  activeMetadataId,
  partiesHeading = 'Parties',
  onActiveMetadataChange,
  onActivePartyChange
}) => {
  const filteredParties = filterParties(parties);
  const base = `${settings.prefix}--semantic-doc-metadata`;

  return (
    <div className={base}>
      {metadata.map((data, index) => (
        <MetadataRow
          key={index}
          metadata={data}
          activeMetadataId={activeMetadataId}
          onActiveMetadataChange={onActiveMetadataChange}
        />
      ))}
      <h3 className={`${base}__party`}>{partiesHeading}</h3>
      {filteredParties.map((party, index) => (
        <PartyRow
          key={index}
          party={party}
          activeMetadataId={activeMetadataId}
          onActivePartyChange={onActivePartyChange}
        />
      ))}
    </div>
  );
};

function showParty(originalParty: Party): boolean {
  const { importance, addresses, contacts, role, party } = originalParty;

  return (
    importance === 'Primary' ||
    addresses.length > 0 ||
    contacts.length > 0 ||
    (!!role && role.toLowerCase() !== 'unknown' && role.toLowerCase() !== party.toLowerCase())
  );
}

function filterParties(parties: Party[] = []): Party[] {
  return parties.filter(party => showParty(party));
}

export default MetadataPane;
