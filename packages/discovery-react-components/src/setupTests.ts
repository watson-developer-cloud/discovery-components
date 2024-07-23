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
