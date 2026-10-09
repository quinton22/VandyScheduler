import { Course } from '../Course';

describe('Course.compareTimes', () => {
  it.each([
    ['9:00am-10:00am', '10:00am-11:00am', false],
    ['9:00am-10:00am', '9:30am-10:30am', true],
    ['11:00am-12:00pm', '12:00pm-1:00pm', false],
    ['12:00pm-1:00pm', '1:00pm-2:00pm', false],
    ['11:00am-1:00pm', '12:00pm-2:00pm', true],
    ['9:00am-10:00am', '1:00pm-2:00pm', false],
    ['09:00-10:00', '10:00-11:00', false],
    ['11:00-12:00pm', '12:00-1:00pm', false],
  ])('compares %s with %s', (first, second, overlaps) => {
    expect(Course.compareTimes(first, second)).toBe(!overlaps);
  });

  it('treats unrecognized times as non-overlapping', () => {
    expect(Course.compareTimes('TBA', '9:00am-10:00am')).toBe(true);
  });
});
