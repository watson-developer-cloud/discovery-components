import '@testing-library/jest-dom/extend-expect';
import * as PdfjsLib from 'pdfjs-dist';

// Set pdf.js worker for all tests
PdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.min.js';
Element.prototype.scrollIntoView = jest.fn();
