import { DocumentInitParameters, TypedArray } from 'pdfjs-dist/types/src/display/api';
import { toPDFSource } from '../utils';

describe('utils', () => {
  describe('toPDFSource', () => {
    it('can create PDFSource from string', () => {
      const stringData = 'PDF file content';
      expect(toPDFSource(stringData).data).toBe(stringData);
    });

    it('can create PDFSource from Uint8Array (cloned)', () => {
      const uint8ArrayData: Uint8Array = new Uint8Array(2);
      const pdfSource = toPDFSource(uint8ArrayData);
      expect(areTypeArraysEqual(pdfSource.data as TypedArray, uint8ArrayData)).toBe(true);
    });

    it('can create PDFSource from ArrayBuffer', () => {
      const arrayBufferData: ArrayBuffer = new ArrayBuffer(2);
      const pdfSource = toPDFSource(arrayBufferData);
      // convert to a typed array to verify underlying data is the same
      expect(
        areTypeArraysEqual(
          new Uint8Array(pdfSource.data as ArrayBuffer),
          new Uint8Array(arrayBufferData)
        )
      ).toBe(true);
    });

    it('can create PDFSource from ArrayBuffer view', () => {
      const arrayBufferViewData: ArrayBufferView = new DataView(new ArrayBuffer(2));
      const pdfSource = toPDFSource(arrayBufferViewData as TypedArray);
      // convert to a typed array to verify underlying data is the same
      expect(
        areTypeArraysEqual(
          new Uint8Array((pdfSource.data as unknown as DataView).buffer),
          new Uint8Array(arrayBufferViewData.buffer)
        )
      ).toBe(true);
    });

    it('can create PDFSource from PDFSource', () => {
      const pdfSourceData: DocumentInitParameters = { data: 'PDF file content' };
      expect(toPDFSource(pdfSourceData)).toBe(pdfSourceData);
    });
  });
});

function areTypeArraysEqual(a: TypedArray, b: TypedArray) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}
