export interface Messages {
  previousLabel?: string;
  nextLabel?: string;
  counterPattern?: string;
  navigation?: string;
}

export const defaultMessages: Messages = {
  previousLabel: 'Previous',
  nextLabel: 'Next',
  navigation: 'Highlighted items navigation',
  counterPattern: '{index} / {max}'
};
