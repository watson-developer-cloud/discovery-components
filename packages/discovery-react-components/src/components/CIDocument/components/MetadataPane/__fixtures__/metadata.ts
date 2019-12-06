import { Metadata } from 'components/CIDocument/types';

export const mockMetadata: Metadata[] = [
  {
    metadataType: 'effective_dates',
    data: [
      {
        location: {
          begin: 4577,
          end: 4594
        },
        text: '24th October 2011',
        text_normalized: '2011-10-24',
        confidence_level: 'High'
      },
      {
        location: {
          begin: 2533,
          end: 2549
        },
        text: '22 December 2008',
        confidence_level: 'Medium',
        text_normalized: '2008-12-22'
      }
    ]
  },
  {
    metadataType: 'contract_terms',
    data: [
      {
        location: {
          begin: 107370,
          end: 107402
        },
        confidence_level: 'Low',
        text: 'within fifteen (15) Working Days',
        text_normalized: '15 days'
      },
      {
        location: {
          begin: 123419,
          end: 123426
        },
        text: '45 days',
        confidence_level: 'Medium',
        text_normalized: '45 days'
      }
    ]
  }
];
