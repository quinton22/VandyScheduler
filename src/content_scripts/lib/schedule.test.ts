import { Course } from './course/course.ts';
import { Schedule } from './schedule.ts';

describe('Schedule', () => {
  it('should sort sections based on least number of overlaps and find all overlapping sections', () => {
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
      'Course2',
      '',
      ['01', '02'],
      ['lecture', 'lecture'],
      ['Cutie, Ura', 'Vanderbilt, Cornelius'],
      ['3.0 hrs', '3.0 hrs'],
      ['MWF', 'MWF'],
      ['01:00p-01:55p', '09:00a-09:55a'],
      ['Featheringill Hall 134', 'Featheringill Hall 134'],
    );
    const course3 = Course.fromArrays(
      'Course3',
      '',
      ['01'],
      ['lecture'],
      ['Chill, Dude'],
      ['3.0 hrs'],
      ['MWF'],
      ['09:00a-09:55a'],
      ['Featheringill Hall 134'],
    );
    const course4 = Course.fromArrays(
      'Course4',
      '',
      ['01', '02'],
      ['lecture', 'lecture'],
      ['Vanderbilt, William', 'Cooper, Anderson'],
      ['3.0 hrs', '3.0 hrs'],
      ['MWF', 'MWF'],
      ['11:00a-11:55a', '02:00p-02:55p'],
      ['Featheringill Hall 134', 'Featheringill Hall 134'],
    );

    const courses = [course1, course2, course3, course4];

    const schedule = new Schedule(courses);

    expect(schedule.overlappedClasses).toMatchInlineSnapshot(`
Map {
  "Course1-01" => 2,
  "Course1-02" => 0,
  "Course2-01" => 0,
  "Course2-02" => 2,
  "Course3-01" => 2,
  "Course4-01" => 0,
  "Course4-02" => 0,
}
`);

    expect(schedule.scheduleArr.length).toEqual(2);

    expect(schedule.scheduleArr).toEqual(
      expect.arrayContaining([
        expect.arrayContaining([
          course1.sections[1],
          course2.sections[0],

          course3.sections[0],
          course4.sections[0],
        ]),
        expect.arrayContaining([
          course1.sections[1],
          course2.sections[0],

          course3.sections[0],
          course4.sections[1],
        ]),
      ]),
    );
  });
});

describe('Schedule (additional)', () => {
  const mk = (name: string, times: string[], days = 'MWF') =>
    Course.fromArrays(
      name,
      '',
      times.map((_, i) => `0${i + 1}`),
      times.map(() => 'lecture'),
      times.map(() => 'Prof'),
      times.map(() => '3.0 hrs'),
      times.map(() => days),
      times,
      times.map(() => 'TBA'),
    );

  it('should handle no courses', () => {
    const schedule = new Schedule([]);
    expect(schedule.getAllPossibleSchedules()).toEqual([]);
  });

  it('should recompute when adding a course and return a copy of schedules', () => {
    const schedule = new Schedule([mk('A', ['09:00a-09:55a'])]);
    expect(schedule.getAllPossibleSchedules()).toHaveLength(1);
    schedule.addCourse(mk('B', ['09:00a-09:55a', '11:00a-11:55a']));
    const all = schedule.getAllPossibleSchedules();
    expect(all.length).toBeGreaterThan(1);
    all.pop();
    expect(schedule.getAllPossibleSchedules().length).toBe(all.length + 1);
    expect(schedule.classesArr).toHaveLength(2);
  });

  it('should produce no schedules if all sections conflict', () => {
    const schedule = new Schedule([
      mk('A', ['09:00a-09:55a']),
      mk('B', ['09:00a-09:55a']),
    ]);
    expect(schedule.scheduleArr).toEqual([]);
  });
});
