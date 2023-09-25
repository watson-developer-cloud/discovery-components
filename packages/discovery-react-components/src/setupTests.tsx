import '@testing-library/jest-dom/extend-expect';
import setPdfJsGlobalWorkerOptions from 'utils/setPdfJsGlobalWorkerOptions';

// Set pdf.js worker for all tests
setPdfJsGlobalWorkerOptions({ workerSrc: './pdf.worker.min.js' });
Element.prototype.scrollIntoView = jest.fn();
