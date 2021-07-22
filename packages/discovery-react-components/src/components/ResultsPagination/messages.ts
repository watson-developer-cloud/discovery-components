export interface Messages {
  /**
   * override the default text for item range that displays the min through max of total results
   * shown on the page
   */
  itemRangeText: string;
  /**
   * override the default text indicating the number of items per page
   */
  itemsPerPageText: string;
  /**
   * override the default text showing where the current page is out of the total pages
   */
  pageRangeText: string;
  /**
   * override the default text showing the current page if total items is unknown
   */
  pageText: string;
}

export const defaultMessages: Messages = {
  itemRangeText: '{min}–{max} of {total} results',
  itemsPerPageText: 'Items per page:',
  pageRangeText: 'of {total} pages',
  pageText: 'Page {page}'
};
