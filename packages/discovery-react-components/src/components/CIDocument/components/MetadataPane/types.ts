import { Location, MetadataData } from 'components/CIDocument/types';

export interface Party {
  role: string;
  party: string;
  importance: Importance;
  addresses: Address[];
  contacts: Contact[];
  mentions: Mention[];
}

export type Importance = 'Primary' | 'Unknown';

export interface Address {
  text: string;
  location: Location;
}

export interface Contact {
  name: string;
  role: string;
}

export interface Mention {
  text: string;
  location: Location;
}

export type OnActiveMetadataChangeFn = (args: {
  metadataId: string;
  metadataType: string;
  data: MetadataData[];
}) => void;

export type OnActivePartyChangeFn = (items: Address[] | Mention[]) => void;
