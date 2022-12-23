/**
 * This is an example implementation of the `DocumentProvider` interface. This will return the PDF
 * contents for the "Art Effects" doc.
 *
 * To see this in action, create a new collection in your project and upload
 * "/examples/discovery-search-app/public/documents/Art Effects.pdf". Then, when running the
 * example app against this collection, if you search and find this document, when you click
 * "View passage in document" (or similar) to open the document view, you will see the PDF
 * itself rendered, instead of HTML or text.
 */
export class ExampleDocumentProvider {
  async provides(document: DocumentProviderProps) {
    // return document.extracted_metadata.filename === 'Art Effects.pdf';
    console.log('dorian change', document.extracted_metadata.filename);
    if (document.extracted_metadata.filename.indexOf('.pdf') >= 0) {
      // hack to force PDF to render
      document.extracted_metadata.text_mappings = true;
      console.log('dorian change, yes pdf');
      return true;
    } else {
      return false;
    }
  }

  async get(document: DocumentProviderProps) {
    // const res = await fetch('http://localhost:3000/documents/Art Effects.pdf');
    if (document.extracted_metadata.filename === 'HIDE_SHOW_THIS_FILE Art Effects Fake Fail.pdf') {
      //const res = await fetch('http://localhost:3000/documents/Art Effects.pdf');
      // Force invalid PDF, throws error
      const res = await fetch('http://localhost:3000/documents/disco-image-input.tiff.pdf');
      console.log('dorian get broken PDF');
      return await res.arrayBuffer();
    } else {
      console.log('dorian get real PDF');
      const res = await fetch(
        'http://localhost:3000/documents/' + document.extracted_metadata.filename
      );
      return await res.arrayBuffer();
    }
  }
}
