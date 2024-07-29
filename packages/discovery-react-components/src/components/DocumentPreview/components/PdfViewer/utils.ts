import { DocumentInitParameters, TypedArray } from 'pdfjs-dist/types/src/display/api';

export function toPDFSource(
  data: NonNullable<DocumentInitParameters['data']> | DocumentInitParameters
): DocumentInitParameters {
  let res: DocumentInitParameters;
  if (typeof data === 'string' || data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
    res = { data: data as TypedArray };
  } else {
    res = data;
  }

  // NOTE: If TypedArrays are used they will generally be transferred to the pdfjs
  // worker-thread. This will help reduce main-thread memory usage, however it will
  // take ownership of the TypedArrays. To avoid being affected by this, we
  // clone the data before passing it on.
  // @see https://github.com/mozilla/pdf.js/commit/397f943ca327dadade6af2eb58685331d3c03065
  // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer#transferring_arraybuffers
  if (res.data instanceof ArrayBuffer || ArrayBuffer.isView(res.data)) {
    return structuredClone(res);
  }

  return res;
}
