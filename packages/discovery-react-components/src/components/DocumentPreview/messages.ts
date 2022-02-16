export interface Messages {
  noDataMessage?: string;
  errorMessage?: string;
  // toolbar labels
  formatTotalPages?: (total: number) => string;
  previousPageLabel?: string;
  nextPageLabel?: string;
  zoomInLabel?: string;
  zoomOutLabel?: string;
  resetZoomLabel?: string;
}

export const defaultMessages: Required<Messages> = {
  noDataMessage: 'No document data',
  errorMessage: 'Error previewing document',
  // toolbar labels
  formatTotalPages: total => (total === 1 ? `${total} page` : `${total} pages`),
  previousPageLabel: 'Previous page',
  nextPageLabel: 'Next page',
  zoomInLabel: 'Zoom in',
  zoomOutLabel: 'Zoom out',
  resetZoomLabel: 'Reset zoom'
};
