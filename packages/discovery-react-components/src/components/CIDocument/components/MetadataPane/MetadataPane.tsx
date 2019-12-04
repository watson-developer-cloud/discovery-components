import React, { FC } from 'react';
import { settings } from 'carbon-components';
import {
  Party,
  OnActiveMetadataChangeFn,
  OnActivePartyChangeFn
} from '@CIDocument/components/MetadataPane/types';
import { Metadata } from '@CIDocument/types';
import MetadataRow from '@CIDocument/components/MetadataPane/components/MetadataRow';
import PartyRow from '@CIDocument/components/MetadataPane/components/PartyRow';
import { defaultMessages, Messages } from '@CIDocument/components/MetadataPane/messages';

interface MetadataPaneProps {
  metadata?: Metadata[];
  parties?: Party[];
  activeMetadataId?: string;
  messages?: Messages;
  onActiveMetadataChange: OnActiveMetadataChangeFn;
  onActivePartyChange: OnActivePartyChangeFn;
}

const MetadataPane: FC<MetadataPaneProps> = ({
  metadata = [],
  parties = [],
  activeMetadataId,
  messages = defaultMessages,
  onActiveMetadataChange,
  onActivePartyChange
}) => {
  const filteredParties = filterParties(parties);
  const base = `${settings.prefix}--ci-doc-metadata`;

  return (
    <div className={base}>
      <div className="section">
        {metadata.map((data, index) => (
          <MetadataRow
            key={index}
            metadata={data}
            activeMetadataId={activeMetadataId}
            onActiveMetadataChange={onActiveMetadataChange}
          />
        ))}
      </div>
      <div className="section">
        <div className="group">
          <h3 className="group-title">{messages.partiesHeading}</h3>
          <ul>
            {filteredParties.map((party, index) => (
              <li key={index}>
                <PartyRow
                  party={party}
                  activeMetadataId={activeMetadataId}
                  onActivePartyChange={onActivePartyChange}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
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
