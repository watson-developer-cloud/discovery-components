export interface Messages {
  previousLabel?: string;
  nextLabel?: string;
  counterPattern?: string;
}

export const defaultMessages: Messages = {
  previousLabel: 'Previous',
  nextLabel: 'Next',
  counterPattern: '{index} / {max}'
};
