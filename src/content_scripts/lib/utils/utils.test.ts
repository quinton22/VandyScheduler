import { safeParseFloat, safeParseInt } from '.';

describe('utils', () => {
  it('safeParseInt', () => {
    expect(safeParseInt('12')).toBe(12);
    expect(safeParseInt('abc')).toBeUndefined();
  });
  it('safeParseFloat', () => {
    expect(safeParseFloat('1.5')).toBe(1.5);
    expect(safeParseFloat('abc')).toBeUndefined();
  });
});
