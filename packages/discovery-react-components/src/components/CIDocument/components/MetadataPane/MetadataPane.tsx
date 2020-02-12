import React, { FC } from 'react';
import { settings } from 'carbon-components';
import { Party, OnActiveMetadataChangeFn, OnActivePartyChangeFn } from './types';
import { Metadata } from 'components/CIDocument/types';
import MetadataRow from './components/MetadataRow';
import PartyRow from './components/PartyRow';
import { defaultMessages, Messages } from './messages';

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
    <div className={base} data-testid="metadata-pane">
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
