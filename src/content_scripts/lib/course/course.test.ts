import { Course, CourseSection } from './course';

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
      ['Featheringill Hall 134', 'Featheringill Hall 134'],
      ['1/10', '10/10'],
    );

    expect(course1.classAbbr).toEqual('Course1');
    expect(course1.sections).toHaveLength(2);
    const [s1, s2] = course1.sections;
    expect(s1.course).toBe(course1);
    expect(s1.section).toEqual('01');
    expect(s1.type).toEqual('lecture');
    expect(s1.professor).toEqual('Dude, My');
    expect(s1.hours).toEqual(3);
    expect(s1.days.daysList).toEqual(['monday', 'wednesday', 'friday']);
    expect(s1.location).toEqual('Featheringill Hall 134');
    expect(s1.availability).toEqual({ filled: 1, total: 10 });
    expect(s2.availability).toEqual({ filled: 10, total: 10 });
    expect(s1.length).toBeCloseTo(55 / 60);
  });

  it('should leave availability undefined when not provided', () => {
    const course = Course.fromArrays(
      'C 1',
      '',
      ['01'],
      ['l'],
      ['p'],
      ['3 hrs'],
      ['M'],
      ['09:00a-09:55a'],
      ['x'],
    );
    expect(course.sections[0].availability).toBeUndefined();
  });

  it('should parse courseData', () => {
    const course = new Course('MATH 1000:', ' Calculus ');
    expect(course.courseData).toEqual({
      department: 'MATH',
      courseNumber: '1000',
      description: 'Calculus',
    });
  });

  describe('CourseSection', () => {
    const raw = {
      section: '01',
      hours: '3.0 hrs',
      type: 'Lecture',
      availability: '0/10',
      days: 'MW',
      time: '09:00a-09:55a',
      location: 'TBA',
      professor: 'Prof',
    };

    it('should detect overlaps', () => {
      const a = new CourseSection(undefined, raw);
      const b = new CourseSection(undefined, { ...raw, days: 'WF' });
      const c = new CourseSection(undefined, { ...raw, days: 'TR' });
      const d = new CourseSection(undefined, {
        ...raw,
        time: '10:00a-10:55a',
      });
      expect(a.overlapsWith(b)).toBe(true);
      expect(a.overlapsWith(c)).toBe(false);
      expect(a.overlapsWith(d)).toBe(false);
      expect(a.getNumOverlaps([b, c, d])).toBe(1);
    });

    it('should only set the course once with addCourse', () => {
      const s = new CourseSection(undefined, raw);
      expect(s.course).toBeUndefined();
      const c1 = new Course('A 1', '');
      const c2 = new Course('B 2', '');
      s.addCourse(c1);
      s.addCourse(c2);
      expect(s.course).toBe(c1);
    });

    it('should stringify', () => {
      const s = new CourseSection(new Course('A 1', ''), raw);
      expect(JSON.parse(s.toString())).toMatchObject({
        course: 'A 1',
        section: '01',
        prof: 'Prof',
        hours: 3,
      });
    });
  });

  describe('addSection', () => {
    it('should add a section to the course', () => {
      const course = new Course('A 1', '');
      course.addSection({
        section: '01',
        hours: '3',
        type: 'Lecture',
        availability: '0/10',
        days: 'M',
        time: '09:00a-09:55a',
        location: 'TBA',
        professor: 'Prof',
      });
      expect(course.sections).toHaveLength(1);
      expect(course.sections[0].course).toBe(course);
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
        ['Featheringill Hall 134', 'Featheringill Hall 134'],
      );

      const parsed = JSON.parse(course1.toString());
      expect(parsed.classAbbr).toEqual('Course1');
      expect(parsed.sections).toHaveLength(2);
      expect(JSON.parse(parsed.sections[0])).toMatchObject({
        course: 'Course1',
        section: '01',
        type: 'lecture',
        prof: 'Dude, My',
        hours: 3,
        location: 'Featheringill Hall 134',
      });
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
        ['Featheringill Hall 134', 'Featheringill Hall 134'],
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
        ['Featheringill Hall 134', 'Featheringill Hall 134'],
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
        ['Featheringill Hall 134', 'Featheringill Hall 134'],
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
        ['Featheringill Hall 134', 'Featheringill Hall 134'],
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
        ],
      );

      course1.removeSection('02');
      expect(course1.sections.map((s) => s.section)).not.toEqual(
        expect.arrayContaining(['02']),
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
        ],
      );

      course1.removeSection('04');
      expect(course1.sections.map((s) => s.section)).toEqual(
        expect.arrayContaining(['01', '02', '03']),
      );
    });
  });
});
