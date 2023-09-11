import '@testing-library/jest-dom/extend-expect';
import setPdfJsGlobalWorkerOptions from 'utils/setPdfJsGlobalWorkerOptions';

// Set pdf.js worker for all tests
setPdfJsGlobalWorkerOptions({ workerSrc: './pdf.worker.min.js' });
Element.prototype.scrollIntoView = jest.fn();

// guidance https://stackoverflow.com/questions/71521976/referenceerror-domrect-is-not-defined
// globalThis https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis
globalThis.DOMRect = class DOMRect {
  bottom: number = 0;
  left: number = 0;
  right: number = 0;
  top: number = 0;
  width: number = 0;
  height: number = 0;
  constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
    this.top = x;
    this.bottom = y + height;
    this.right = x + width;
    this.left = x;
  }
  static fromRect(other: DOMRect) {
    return new DOMRect(other.top, other.left, other.width, other.height);
  }
  toJSON() {
    return JSON.stringify(this);
  }
};
