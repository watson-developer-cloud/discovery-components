export interface Messages {
  defaultDocumentName?: string;
  attributesTabLabel?: string;
  relationsTabLabel?: string;
  filtersTabLabel?: string;
  metadataTabLabel?: string;
  parseErrorMessage?: string;
  contractCategoryLabel?: string;
  contractNatureLabel?: string;
  contractPartyLabel?: string;
  contractAttributeLabel?: string;
  invoiceAttributeLabel?: string;
  invoiceRelationsLabel?: string;
}

export const defaultMessages: Messages = {
  defaultDocumentName: 'Document',
  attributesTabLabel: 'Attributes',
  relationsTabLabel: 'Relations',
  filtersTabLabel: 'Filters',
  metadataTabLabel: 'Metadata',
  parseErrorMessage: 'There was an error parsing the document',
  contractCategoryLabel: 'Category',
  contractNatureLabel: 'Nature',
  contractPartyLabel: 'Party',
  contractAttributeLabel: 'Attribute',
  invoiceAttributeLabel: 'Attribute',
  invoiceRelationsLabel: 'Relation'
};
