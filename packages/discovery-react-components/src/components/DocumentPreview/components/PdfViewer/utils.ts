import { PDFSource } from 'pdfjs-dist';

export function toPDFSource(data: NonNullable<PDFSource['data']> | PDFSource): PDFSource {
  if (typeof data === 'string' || data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
    return { data };
  }
  return data;
}
