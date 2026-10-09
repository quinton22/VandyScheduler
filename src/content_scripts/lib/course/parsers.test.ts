import {
  availabilityParser,
  courseTitleParser,
  hoursParser,
  timeParser,
} from './parsers';

describe('parsers', () => {
  it('courseTitleParser', () => {
    expect(courseTitleParser(' CS 1101: ')).toEqual({
      department: 'CS',
      courseNumber: '1101',
    });
  });

  it('hoursParser', () => {
    expect(hoursParser('3.0 hrs')).toBe(3);
    expect(hoursParser('1.5')).toBe(1.5);
    expect(hoursParser('  ')).toBe(0);
    expect(() => hoursParser('none')).toThrow('Could not parse');
  });

  it('availabilityParser', () => {
    expect(availabilityParser('3/10')).toEqual({ filled: 3, total: 10 });
    expect(() => availabilityParser('abc')).toThrow('Could not parse');
    expect(() => availabilityParser('3')).toThrow('Could not parse');
  });

  it('timeParser', () => {
    const t = timeParser('01:15p - 04:05p');
    expect(t.start.hour).toBe(13);
    expect(t.end.minute).toBe(5);
    expect(() => timeParser('01:15p')).toThrow();
  });
});
