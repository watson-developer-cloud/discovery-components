import { DocumentInitParameters, TypedArray } from 'pdfjs-dist/types/display/api';
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
      expect(toPDFSource(arrayBufferData as TypedArray).data).toBe(arrayBufferData);
    });

    it('can create PDFSource from ArrayBuffer view', () => {
      const arrayBufferViewData: ArrayBufferView = new DataView(new ArrayBuffer(2));
      expect(toPDFSource(arrayBufferViewData as TypedArray).data).toBe(arrayBufferViewData);
    });

    it('can create PDFSource from PDFSource', () => {
      const pdfSourceData: DocumentInitParameters = { data: 'PDF file content' };
      expect(toPDFSource(pdfSourceData)).toBe(pdfSourceData);
    });
  });
});
