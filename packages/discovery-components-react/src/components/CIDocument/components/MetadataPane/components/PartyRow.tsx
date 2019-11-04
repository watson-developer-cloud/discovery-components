import React, { FC } from 'react';
import cx from 'classnames';
import { settings } from 'carbon-components';
import { Link } from 'carbon-components-react';
import { getId } from '../../../../../utils/document/idUtils';
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
}) => {
  const base = `${settings.prefix}--ci-doc-metadata`;
  return (
    <>
      {party.mentions ? (
        <Link
          className={`${base}__link`}
          onClick={(evt: MouseEvent): void => {
            onLinkClick(evt, party.mentions, onActivePartyChange);
          }}
          href="#"
        >
          <p
            className={cx({
              [`${base}__selected`]: party.mentions.some(
                mention => getId(mention) === activeMetadataId
              )
            })}
          >
            {getNameRoleDisplayString({
              name: party.party,
              role: party.role
            })}
            &nbsp;({party.mentions.length})
          </p>
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
            {party.addresses.map(address => {
              return (
                <div key={getId(address)}>
                  <Link
                    className={`${base}__link`}
                    href="#"
                    onClick={(evt: MouseEvent): void => {
                      onLinkClick(evt, party.addresses, onActivePartyChange);
                    }}
                  >
                    <p
                      className={cx({
                        [`${base}__selected`]: party.addresses.some(
                          adrs => getId(adrs) === activeMetadataId
                        )
                      })}
                    >
                      {address.text}
                    </p>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {party.contacts.length > 0 && (
          <div>
            <h3>{contactsHeading}</h3>
            {party.contacts.map(contact => (
              <p key={`${contact.name}-${contact.role}`}>{getNameRoleDisplayString(contact)}</p>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

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
