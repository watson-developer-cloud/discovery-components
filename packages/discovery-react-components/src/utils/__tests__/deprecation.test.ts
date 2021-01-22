import { deprecateReturnFields } from '../deprecation';

describe('deprecation', () => {
  const originalWarn = console.warn;
  beforeEach(() => {
    console.warn = jest.fn();
    jest.resetAllMocks();
  });
  afterEach(() => {
    console.warn = originalWarn;
  });
  describe('deprecateReturnFields', () => {
    it('copies returnFields to _return', () => {
      expect(deprecateReturnFields({ returnFields: ['foo'] })).toEqual({ _return: ['foo'] });
    });

    it('logs a deprecation warning when returnFields is used', () => {
      deprecateReturnFields({ returnFields: ['foo'] });
      expect(console.warn).toHaveBeenCalledWith(
        '"returnFields" has been renamed to "_return". Support for "returnFields" will be removed in the next major release'
      );
    });
  });
});
