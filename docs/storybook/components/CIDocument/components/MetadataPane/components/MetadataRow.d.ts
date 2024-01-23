import { FC } from 'react';
import { Metadata } from 'components/CIDocument/types';
import { OnActiveMetadataChangeFn } from '../types';
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
declare const MetadataRow: FC<MetadataRowProps>;
export default MetadataRow;
