import { Party } from '../types';

export const mockParties: Party[] = [
  {
    role: 'Buyer',
    contacts: [],
    importance: 'Primary',
    mentions: [
      {
        text: 'ART EFFECTS LIMITED',
        location: {
          begin: 2550,
          end: 2569
        }
      },
      {
        text: 'Art Effects Limited',
        location: {
          begin: 3604,
          end: 3623
        }
      },
      {
        text: 'Art Effects Limited',
        location: {
          begin: 444845,
          end: 444864
        }
      },
      {
        text: 'Art Effects Limited',
        location: {
          begin: 469780,
          end: 469799
        }
      },
      {
        text: 'Art Effects Limited',
        location: {
          begin: 470714,
          end: 470733
        }
      }
    ],
    party: 'ART EFFECTS',
    addresses: []
  },
  {
    role: 'Supplier',
    contacts: [],
    importance: 'Primary',
    mentions: [
      {
        text: 'Koya Creative LLC',
        location: {
          begin: 3990,
          end: 4007
        }
      },
      {
        text: 'Koya Creative LLC',
        location: {
          begin: 444865,
          end: 444882
        }
      },
      {
        text: 'Koya Creative LLC',
        location: {
          begin: 469800,
          end: 469817
        }
      }
    ],
    party: 'KOYA CREATIVE',
    addresses: []
  },
  {
    role: 'Unknown',
    contacts: [],
    importance: 'Unknown',
    mentions: [
      {
        text: 'Bank of England',
        location: {
          begin: 31143,
          end: 31158
        }
      },
      {
        text: 'Bank of England',
        location: {
          begin: 438469,
          end: 438484
        }
      }
    ],
    party: 'BANK OF ENGLAND',
    addresses: []
  },
  {
    role: 'Unknown',
    contacts: [],
    importance: 'Unknown',
    mentions: [
      {
        text: 'Base Ltd',
        location: {
          begin: 414486,
          end: 414494
        }
      }
    ],
    party: 'BASE',
    addresses: []
  }
];
