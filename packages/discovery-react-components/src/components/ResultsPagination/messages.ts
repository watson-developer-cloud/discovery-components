export interface Messages {
  /**
   * override the default text for item range that displays the min through max of total results
   * shown on the page
   */
  itemRangeText: string;
  /**
   * The character that should be used to delimit large numbers with at least 4 digits.
   * Use an empty string if no delimiter is desired.
   */
  numberDelimiter: string;
}

export const defaultMessages: Messages = {
  itemRangeText: '{min}–{max} of {total} results',
  numberDelimiter: ','
};
