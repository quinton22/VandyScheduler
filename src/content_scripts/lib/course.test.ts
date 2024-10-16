import { Course } from './course';

describe('Course', () => {
  it('should correctly create a course from arrays', () => {
    const course1 = Course.fromArrays(
      'Course1',
      '',
      ['01', '02'],
      ['lecture', 'lecture'],
      ['Dude, My', 'Commodore, Mister'],
      ['3.0 hrs', '3.0 hrs'],
      ['MWF', 'MWF'],
      ['09:00a-09:55a', '10:00a-10:55a'],
      ['Featheringill Hall 134', 'Featheringill Hall 134']
    );

    expect(course1).toMatchInlineSnapshot(`
Course {
  "classAbbr": "Course1",
  "classDesc": "",
  "sections": [
    CourseSection {
      "_course": [Circular],
      "days": "MWF",
      "hours": "3.0 hrs",
      "location": "Featheringill Hall 134",
      "prof": "Dude, My",
      "section": "01",
      "time": "09:00a-09:55a",
      "type": "lecture",
    },
    CourseSection {
      "_course": [Circular],
      "days": "MWF",
      "hours": "3.0 hrs",
      "location": "Featheringill Hall 134",
      "prof": "Commodore, Mister",
      "section": "02",
      "time": "10:00a-10:55a",
      "type": "lecture",
    },
  ],
}
`);
  });

  describe('compareTimes', () => {
    const overlappingTimes: [string, string][] = [
      ['01:10a-11:55p', '08:43a-09:12a'],
      ['08:15a-09:16a', '01:02a-11:55p'],
      ['08:34a-09:56a', '09:49a-09:58a'],
      ['09:49a-09:58a', '08:34a-09:56a'],
      ['09:56a-09:58a', '08:34a-09:56a'],
      ['07:12a-08:34a', '08:34a-09:56a'],
    ];
    const nonOverlappingTimes: [string, string][] = [
      ['01:10p-11:55p', '08:43a-09:12a'],
      ['08:15a-09:16a', '01:02p-11:55p'],
      ['08:34a-09:56a', '09:57a-10:58a'],
      ['09:57a-10:58a', '08:34a-09:56a'],
    ];
    it('should return false if times overlap and true if they do not overlap', () => {
      for (const times of overlappingTimes) {
        expect(Course.compareTimes(...times)).toEqual(false);
      }
      for (const times of nonOverlappingTimes) {
        expect(Course.compareTimes(...times)).toEqual(true);
      }
    });
  });

  describe('compareDays', () => {
    const overlappingDays: [string, string][] = [
      ['M', 'MWF'],
      ['TR', 'R'],
      ['MWF', 'TF'],
    ];
    const nonOverlappingDays: [string, string][] = [
      ['MWF', 'TR'],
      ['M', 'TRWF'],
      ['WF', 'MR'],
      ['', 'MTWRF'],
      ['MTWRF', ''],
      ['', ''],
    ];
    it('should return false if the first set of days shares any day with the second set', () => {
      for (const days of overlappingDays) {
        expect(Course.compareDays(...days)).toEqual(false);
      }
      for (const days of nonOverlappingDays) {
        expect(Course.compareDays(...days)).toEqual(true);
      }
    });
  });

  describe('lengthOfClass', () => {
    it('should return the length of the class in the form of <hours>.<minutes/60>', () => {
      expect(Course.lengthOfClass('01:12a-01:55a')).toBeCloseTo(0.71666);
      expect(Course.lengthOfClass('01:12a-02:10a')).toBeCloseTo(0.96666);
      expect(Course.lengthOfClass('01:12a-02:23a')).toBeCloseTo(1.18333);
      expect(Course.lengthOfClass('11:12a-12:01p')).toBeCloseTo(0.81666);
      expect(Course.lengthOfClass('11:12a-12:24p')).toBeCloseTo(1.2);
      expect(Course.lengthOfClass('01:12p-03:24p')).toBeCloseTo(2.2);
      expect(Course.lengthOfClass('10:12p-11:01p')).toBeCloseTo(0.81666);
    });
  });

  describe('toString', () => {
    it('should stringify properly', () => {
      const course1 = Course.fromArrays(
        'Course1',
        '',
        ['01', '02'],
        ['lecture', 'lecture'],
        ['Dude, My', 'Commodore, Mister'],
        ['3.0 hrs', '3.0 hrs'],
        ['MWF', 'MWF'],
        ['09:00a-09:55a', '10:00a-10:55a'],
        ['Featheringill Hall 134', 'Featheringill Hall 134']
      );

      expect(course1.toString()).toMatchInlineSnapshot(
        `"{"classAbbr":"Course1","classDesc":"","sections":["{\\"course\\":\\"Course1\\",\\"section\\":\\"01\\",\\"type\\":\\"lecture\\",\\"prof\\":\\"Dude, My\\",\\"hours\\":\\"3.0 hrs\\",\\"days\\":\\"MWF\\",\\"time\\":\\"09:00a-09:55a\\",\\"location\\":\\"Featheringill Hall 134\\"}","{\\"course\\":\\"Course1\\",\\"section\\":\\"02\\",\\"type\\":\\"lecture\\",\\"prof\\":\\"Commodore, Mister\\",\\"hours\\":\\"3.0 hrs\\",\\"days\\":\\"MWF\\",\\"time\\":\\"10:00a-10:55a\\",\\"location\\":\\"Featheringill Hall 134\\"}"]}"`
      );
    });
  });

  describe('equal', () => {
    it('should base equality on the string value', () => {
      const course1 = Course.fromArrays(
        'Course1',
        '',
        ['01', '02'],
        ['lecture', 'lecture'],
        ['Dude, My', 'Commodore, Mister'],
        ['3.0 hrs', '3.0 hrs'],
        ['MWF', 'MWF'],
        ['09:00a-09:55a', '10:00a-10:55a'],
        ['Featheringill Hall 134', 'Featheringill Hall 134']
      );
      const course2 = Course.fromArrays(
        'Course1',
        '',
        ['01', '02'],
        ['lecture', 'lecture'],
        ['Dude, My', 'Commodore, Mister'],
        ['3.0 hrs', '3.0 hrs'],
        ['MWF', 'MWF'],
        ['09:00a-09:55a', '10:00a-10:55a'],
        ['Featheringill Hall 134', 'Featheringill Hall 134']
      );
      const course3 = Course.fromArrays(
        'Course1',
        'oops',
        ['01', '02'],
        ['lecture', 'lecture'],
        ['Dude, My', 'Commodore, Mister'],
        ['3.0 hrs', '3.0 hrs'],
        ['MWF', 'MWF'],
        ['09:00a-09:55a', '10:00a-10:55a'],
        ['Featheringill Hall 134', 'Featheringill Hall 134']
      );

      expect(course1.equal(course2)).toEqual(true);
      expect(course2.equal(course1)).toEqual(true);
      expect(course2.equal(course3)).toEqual(false);
      expect(course1.equal(course3)).toEqual(false);
    });
  });
  describe('copy', () => {
    it('should produce a copy', () => {
      const course1 = Course.fromArrays(
        'Course1',
        '',
        ['01', '02'],
        ['lecture', 'lecture'],
        ['Dude, My', 'Commodore, Mister'],
        ['3.0 hrs', '3.0 hrs'],
        ['MWF', 'MWF'],
        ['09:00a-09:55a', '10:00a-10:55a'],
        ['Featheringill Hall 134', 'Featheringill Hall 134']
      );

      const course2 = course1.copy();

      expect(course1.equal(course2)).toEqual(true);
    });
  });
  describe('removeSection', () => {
    it('should remove section by section name', () => {
      const course1 = Course.fromArrays(
        'Course1',
        '',
        ['01', '02', '03'],
        ['lecture', 'lecture', 'lecture'],
        ['Dude, My', 'Commodore, Mister', 'Nice, Guy'],
        ['3.0 hrs', '3.0 hrs', '3.0 hrs'],
        ['MWF', 'MWF', 'MWF'],
        ['09:00a-09:55a', '10:00a-10:55a', '11:00a-11:55a'],
        [
          'Featheringill Hall 134',
          'Featheringill Hall 134',
          'Featheringill Hall 134',
        ]
      );

      course1.removeSection('02');
      expect(course1.sections.map((s) => s.section)).not.toEqual(
        expect.arrayContaining(['02'])
      );
    });

    it('should not do anything if section does not exist in course', () => {
      const course1 = Course.fromArrays(
        'Course1',
        '',
        ['01', '02', '03'],
        ['lecture', 'lecture', 'lecture'],
        ['Dude, My', 'Commodore, Mister', 'Nice, Guy'],
        ['3.0 hrs', '3.0 hrs', '3.0 hrs'],
        ['MWF', 'MWF', 'MWF'],
        ['09:00a-09:55a', '10:00a-10:55a', '11:00a-11:55a'],
        [
          'Featheringill Hall 134',
          'Featheringill Hall 134',
          'Featheringill Hall 134',
        ]
      );

      course1.removeSection('04');
      expect(course1.sections.map((s) => s.section)).toEqual(
        expect.arrayContaining(['01', '02', '03'])
      );
    });
  });
});
