import React, { FC } from 'react';
import cx from 'classnames';
import { Link } from 'carbon-components-react';
import { getId } from 'utils/document/idUtils';
import { Party, Address, Mention, OnActivePartyChangeFn } from '../types';

const HIDDEN_ROLES = ['Unknown'];

interface PartyRowProps {
  party: Party;
  activeMetadataId?: string;
  addressesHeading?: string;
  contactsHeading?: string;
  onActivePartyChange: OnActivePartyChangeFn;
}

const PartyRow: FC<PartyRowProps> = ({
  party,
  activeMetadataId,
  addressesHeading = 'Addresses',
  contactsHeading = 'Contacts',
  onActivePartyChange
}) => (
  <>
    {party.mentions ? (
      <Link
        className={cx('link', {
          selected: party.mentions.some(mention => getId(mention) === activeMetadataId)
        })}
        onClick={(evt: MouseEvent): void => {
          onLinkClick(evt, party.mentions, onActivePartyChange);
        }}
        href="#"
      >
        {getNameRoleDisplayString({
          name: party.party,
          role: party.role
        })}
        &nbsp;({party.mentions.length})
      </Link>
    ) : (
      <p>
        {getNameRoleDisplayString({
          name: party.party,
          role: party.role
        })}
      </p>
    )}
    <div>
      {party.addresses.length > 0 && (
        <div>
          <h3>{addressesHeading}</h3>
          <ul>
            {party.addresses.map(address => {
              return (
                <li key={getId(address)}>
                  <Link
                    className={cx('link', {
                      selected: party.addresses.some(adrs => getId(adrs) === activeMetadataId)
                    })}
                    href="#"
                    onClick={(evt: MouseEvent): void => {
                      onLinkClick(evt, party.addresses, onActivePartyChange);
                    }}
                  >
                    {address.text}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {party.contacts.length > 0 && (
        <div>
          <h3>{contactsHeading}</h3>
          <ul>
            {party.contacts.map(contact => (
              <li key={`${contact.name}-${contact.role}`}>{getNameRoleDisplayString(contact)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </>
);

function getNameRoleDisplayString({ name, role }: { name: string; role: string }): string {
  if (role && !HIDDEN_ROLES.includes(role)) {
    return `${name} (${role})`;
  }
  return name;
}

function onLinkClick(
  evt: MouseEvent,
  items: Address[] | Mention[],
  onActivePartyChange: OnActivePartyChangeFn
): void {
  evt.preventDefault();
  onActivePartyChange(items);
}

export default PartyRow;
