/**
 * Set up `jest` when run from `react-scripts`
 */

import '@testing-library/jest-dom/extend-expect';
// polyfill for `Promise.withResolvers()`
import 'core-js/proposals/promise-with-resolvers';
import setPdfJsGlobalWorkerOptions from 'utils/setPdfJsGlobalWorkerOptions';

// Set pdf.js worker for all tests
setPdfJsGlobalWorkerOptions({ workerSrc: './pdf.worker.min.mjs' });
Element.prototype.scrollIntoView = jest.fn();

const originalConsoleError = global.console.error;
beforeAll(() => {
  global.console.error = (...args) => {
    // JSDOM doesn't have a robust CSS implementation and will sometimes fail to
    // correctly parse valid CSS, throwing an error that isn't really an error and
    // polluting test output. This code hides this "error".
    if (
      typeof args[0]?.toString === 'function' &&
      args[0].toString().includes('Error: Could not parse CSS stylesheet')
    ) {
      return;
    }

    originalConsoleError(...args);
  };
});
