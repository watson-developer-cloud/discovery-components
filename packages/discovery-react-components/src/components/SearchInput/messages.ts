export interface Messages {
  /**
   * Placeholder text for the SearchInput
   */
  placeholderText: string;
  /**
   * Label text for the close button
   */
  closeButtonLabelText: string;
}

export const defaultMessages: Messages = {
  placeholderText: 'Search',
  closeButtonLabelText: 'Clear search input'
};
