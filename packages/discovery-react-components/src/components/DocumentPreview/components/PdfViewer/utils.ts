import { DocumentInitParameters, TypedArray } from 'pdfjs-dist/types/display/api';

export function toPDFSource(
  data: NonNullable<DocumentInitParameters['data']> | DocumentInitParameters
): DocumentInitParameters {
  if (typeof data === 'string' || data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
    return { data: data as TypedArray };
  }
  return data;
}
