export interface Messages {
  defaultDocumentName?: string;
  parseErrorMessage?: string;
}

export const defaultMessages: Messages = {
  defaultDocumentName: 'Document',
  parseErrorMessage: 'There was an error parsing the document'
};
