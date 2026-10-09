import { CourseSectionDays } from './courseSectionDays';

describe('CourseSectionDays', () => {
  it('should parse from string', () => {
    const d = CourseSectionDays.fromString('MTWRFSU');
    expect(d.daysList).toEqual([
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ]);
  });

  it('should ignore unknown characters', () => {
    expect(CourseSectionDays.fromString('M?').daysList).toEqual(['monday']);
  });

  it('should expose a record and hasDay', () => {
    const d = CourseSectionDays.fromString('MW');
    expect(d.hasDay('monday')).toBe(true);
    expect(d.hasDay('friday')).toBe(false);
    expect(d.daysRecord).toMatchObject({
      monday: true,
      wednesday: true,
      friday: false,
    });
  });

  it('should find overlapping days', () => {
    const a = CourseSectionDays.fromString('MWF');
    const b = CourseSectionDays.fromString('TF');
    const c = CourseSectionDays.fromString('TR');
    expect(a.getOverlappingDays(b)).toEqual(['friday']);
    expect(a.overlapsWith(b)).toBe(true);
    expect(a.overlapsWith(c)).toBe(false);
  });
});
