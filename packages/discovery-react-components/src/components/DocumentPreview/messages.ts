export interface Messages {
  noDataMessage?: string;
  errorMessage?: string;
  // toolbar labels
  previousPageLabel?: string;
  nextPageLabel?: string;
  zoomInLabel?: string;
  zoomOutLabel?: string;
  resetZoomLabel?: string;
}

export const defaultMessages = {
  noDataMessage: 'No document data',
  errorMessage: 'Error previewing document',
  // toolbar labels
  previousPageLabel: 'Previous page',
  nextPageLabel: 'Next page',
  zoomInLabel: 'Zoom in',
  zoomOutLabel: 'Zoom out',
  resetZoomLabel: 'Reset zoom'
};
