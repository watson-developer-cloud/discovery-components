import React, { FC } from 'react';
import cx from 'classnames';
import { Link, Tooltip } from 'carbon-components-react';
import { Metadata, MetadataData } from 'components/CIDocument/types';
import { OnActiveMetadataChangeFn } from '../types';
import { getId } from 'utils/document/idUtils';
import { ReactComponent as HighConfidence } from './icons/Confidence_high.svg';
import { ReactComponent as MediumConfidence } from './icons/Confidence_medium.svg';
import { ReactComponent as LowConfidence } from './icons/Confidence_low.svg';

interface MetadataRowProps {
  metadata: Metadata;
  activeMetadataId?: string;
  contactsLabel?: string;
  partiesLabel?: string;
  confidenceLabel?: string;
  highConfidenceTooltipText?: string;
  mediumConfidenceTooltipText?: string;
  lowConfidenceTooltipText?: string;
  onActiveMetadataChange: OnActiveMetadataChangeFn;
}

const MetadataRow: FC<MetadataRowProps> = ({
  metadata,
  activeMetadataId,
  contactsLabel = 'Contacts',
  partiesLabel = 'Parties',
  confidenceLabel = 'Confidence',
  highConfidenceTooltipText = 'High confidence: Watson is very confident that the identified data is correct.',
  mediumConfidenceTooltipText = 'Medium confidence: Watson is somewhat confident that the identified data is correct.',
  lowConfidenceTooltipText = 'Low confidence: Watson is unsure if the identified data is correct.',
  onActiveMetadataChange
}) => {
  const { metadataType, data } = metadata;
  const headings = {
    contacts: contactsLabel,
    parties: partiesLabel,
    contract_amounts: 'Contract amounts',
    effective_dates: 'Effective dates',
    termination_dates: 'Termination dates',
    contract_types: 'Contract types',
    contract_terms: 'Contract terms',
    payment_terms: 'Payment terms'
  };
  const confidenceLevel = {
    High: {
      icon: HighConfidence,
      description: highConfidenceTooltipText
    },
    Medium: {
      icon: MediumConfidence,
      description: mediumConfidenceTooltipText
    },
    Low: {
      icon: LowConfidence,
      description: lowConfidenceTooltipText
    }
  };

  return (
    <div className="group">
      <h3 className="group-title">{headings[metadataType]} </h3>
      <ul>
        {data.map(dt => {
          const metadataId = getId(dt);
          const metadataTypeId = getMetadataTypeId(metadataId, metadataType);

          return (
            <li key={metadataTypeId}>
              <Tooltip
                direction="right"
                iconDescription={confidenceLabel}
                renderIcon={confidenceLevel[dt.confidence_level].icon}
                tabIndex={0}
                size="small"
              >
                {confidenceLevel[dt.confidence_level].description}
              </Tooltip>
              <Link
                className={cx({
                  selected: getMetadataTypeId(activeMetadataId, metadataType) === metadataTypeId
                })}
                href="#"
                onClick={(evt: MouseEvent): void => {
                  onLinkClick(evt, metadataId, metadataType, onActiveMetadataChange, dt);
                }}
              >
                {dt.text_normalized || dt.text}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

function onLinkClick(
  evt: MouseEvent,
  metadataId: string,
  metadataType: string,
  onActiveMetadataChange: OnActiveMetadataChangeFn,
  data: MetadataData
): void {
  evt.preventDefault();
  data.metadataType = metadataType;
  onActiveMetadataChange({ metadataId, metadataType, data: [data] });
}

function getMetadataTypeId(id: string | undefined, metadataType: string): string {
  return id ? `${id}_${metadataType}` : '';
}

export default MetadataRow;
