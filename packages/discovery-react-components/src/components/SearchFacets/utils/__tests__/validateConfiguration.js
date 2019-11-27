import { validateConfiguration } from '../validateConfiguration';

describe('validate configuration correctly validates input', () => {
  test('it returns false when string is provided for configuration', () => {
    const validConfiguration = validateConfiguration('Hello');
    expect(validConfiguration).toEqual(false);
  });

  test('it returns false when array of strings is provided for configuration', () => {
    const validConfiguration = validateConfiguration(['Hello', 'There']);
    expect(validConfiguration).toEqual(false);
  });

  test('it returns false when field is not a string', () => {
    const validConfiguration = validateConfiguration([
      {
        field: 5,
        count: 10
      },
      {
        count: 5
      }
    ]);
    expect(validConfiguration).toEqual(false);
  });

  test('it returns false when count is present and is not a number', () => {
    const validConfiguration = validateConfiguration([
      {
        field: 'enriched_text.entities.text',
        count: 'I am not a number'
      },
      {
        count: 5
      }
    ]);
    expect(validConfiguration).toEqual(false);
  });

  test('it provides invalid message when no configuration is provided', () => {
    const validConfiguration = validateConfiguration(undefined);
    expect(validConfiguration).toEqual(false);
  });
});
