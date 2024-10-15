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
});
