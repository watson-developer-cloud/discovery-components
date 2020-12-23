import '@testing-library/jest-dom/extend-expect';
import 'jest-canvas-mock';

Element.prototype.scrollIntoView = jest.fn();
