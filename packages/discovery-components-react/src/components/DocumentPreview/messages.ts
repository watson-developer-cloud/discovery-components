export interface Messages {
  noDataMessage?: string;
  errorMessage?: string;
}

export const defaultMessages: Messages = {
  noDataMessage: 'No document data',
  errorMessage: 'Error previewing document'
};
