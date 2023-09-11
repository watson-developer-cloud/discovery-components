import '@testing-library/jest-dom/extend-expect';
import setPdfJsGlobalWorkerOptions from 'utils/setPdfJsGlobalWorkerOptions';

// Set pdf.js worker for all tests
setPdfJsGlobalWorkerOptions({ workerSrc: './pdf.worker.min.js' });
Element.prototype.scrollIntoView = jest.fn();

// guidance https://stackoverflow.com/questions/71521976/referenceerror-domrect-is-not-defined
// globalThis https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis
globalThis.DOMRect = class DOMRect {
  bottom = 0;
  left = 0;
  right = 0;
  top = 0;
  constructor(x = 0, y = 0, width = 0, height = 0) {}
  static fromRect(other) {
    return new DOMRect(other.x, other.y, other.width, other.height);
  }
  toJSON() {
    return JSON.stringify(this);
  }
};
