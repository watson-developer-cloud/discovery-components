import { PDFSource } from 'pdfjs-dist';
import { toPDFSource } from '../utils';

describe('utils', () => {
  describe('toPDFSource', () => {
    it('can create PDFSource from string', () => {
      const stringData = 'PDF file content';
      expect(toPDFSource(stringData).data).toBe(stringData);
    });

    it('can create PDFSource from Uint8Array', () => {
      const uint8ArrayData: Uint8Array = new Uint8Array(2);
      expect(toPDFSource(uint8ArrayData).data).toBe(uint8ArrayData);
    });

    it('can create PDFSource from ArrayBuffer', () => {
      const arrayBufferData: ArrayBuffer = new ArrayBuffer(2);
      expect(toPDFSource(arrayBufferData).data).toBe(arrayBufferData);
    });

    it('can create PDFSource from ArrayBuffer view', () => {
      const arrayBufferViewData: ArrayBufferView = new DataView(new ArrayBuffer(2));
      expect(toPDFSource(arrayBufferViewData).data).toBe(arrayBufferViewData);
    });

    it('can create PDFSource from PDFSource', () => {
      const pdfSourceData: PDFSource = { data: 'PDF file content' };
      expect(toPDFSource(pdfSourceData)).toBe(pdfSourceData);
    });
  });
});
