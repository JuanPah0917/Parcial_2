import { isValidGmail } from '../App';

describe('Utility Functions', () => {
  test('validates Gmail addresses correctly', () => {
    expect(isValidGmail('test@gmail.com')).toBe(true);
    expect(isValidGmail('test@hotmail.com')).toBe(false);
    expect(isValidGmail('test@outlook.com')).toBe(false);
  });
});